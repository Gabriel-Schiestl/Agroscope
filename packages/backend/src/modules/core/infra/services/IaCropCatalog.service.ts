import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AvailableCrop } from '../../domain/models/Crop';
import { CropCatalogService } from '../../domain/services/CropCatalog.service';

interface IaCulturesResponse {
    cultures: { code?: string; label?: string; classes?: string[] }[];
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Lê as culturas disponíveis da IA (GET /cultures) e guarda em cache.
 *
 * A IA só aceita conexões depois de carregar os modelos, o que pode levar
 * bem mais que a subida do backend. Por isso nada aqui bloqueia o boot:
 * - no boot tenta uma vez em segundo plano, só para aquecer o cache;
 * - depois, busca de novo quando o cache vence (CROP_CATALOG_TTL_MS);
 * - se a IA não responder, segue com o último catálogo conhecido e só falha
 *   se ela nunca respondeu.
 */
@Injectable()
export class IaCropCatalogService
    implements CropCatalogService, OnApplicationBootstrap
{
    private readonly logger = new Logger(IaCropCatalogService.name);
    private readonly ttlMs =
        Number(process.env.CROP_CATALOG_TTL_MS) || DEFAULT_TTL_MS;

    private crops: AvailableCrop[] | null = null;
    private fetchedAt = 0;
    private inFlight: Promise<
        Result<TechnicalException, AvailableCrop[]>
    > | null = null;

    constructor(private readonly httpService: HttpService) {}

    onApplicationBootstrap() {
        void this.getAvailableCrops();
    }

    async getAvailableCrops(): Promise<
        Result<TechnicalException, AvailableCrop[]>
    > {
        if (this.crops && Date.now() - this.fetchedAt < this.ttlMs) {
            return Res.success(this.crops);
        }

        // Várias requisições ao mesmo tempo compartilham uma única chamada à IA
        this.inFlight ??= this.refresh().finally(() => {
            this.inFlight = null;
        });
        return this.inFlight;
    }

    private async refresh(): Promise<
        Result<TechnicalException, AvailableCrop[]>
    > {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get<IaCulturesResponse>(
                    `${process.env.FLASK_API_URL}/cultures`,
                    { timeout: 5000 },
                ),
            );

            const crops = (data?.cultures ?? [])
                .filter((c) => typeof c.code === 'string' && c.code)
                .map((c) => ({
                    code: c.code.toUpperCase(),
                    label: c.label || c.code,
                    classes: c.classes ?? [],
                }));

            if (!this.sameCodes(crops)) {
                this.logger.log(
                    `Culturas disponíveis na IA: ${crops.map((c) => c.code).join(', ') || 'nenhuma'}`,
                );
            }

            this.crops = crops;
            this.fetchedAt = Date.now();
            return Res.success(crops);
        } catch (error) {
            if (this.crops) {
                this.logger.warn(
                    `IA não respondeu ao atualizar as culturas (${error.message}); mantendo o catálogo anterior`,
                );
                return Res.success(this.crops);
            }

            this.logger.warn(
                `IA ainda não respondeu com as culturas disponíveis: ${error.message}`,
            );
            return Res.failure(
                new TechnicalException(
                    'O serviço de análise ainda está iniciando. Tente novamente em instantes.',
                ),
            );
        }
    }

    private sameCodes(crops: AvailableCrop[]): boolean {
        const codes = (list: AvailableCrop[]) =>
            list
                .map((c) => c.code)
                .sort()
                .join();
        return this.crops !== null && codes(this.crops) === codes(crops);
    }
}
