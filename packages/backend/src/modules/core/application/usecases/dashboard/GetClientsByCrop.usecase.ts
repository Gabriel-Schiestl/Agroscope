import { Inject, Injectable } from '@nestjs/common';
import { Crop } from 'src/modules/core/domain/models/Client';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ClientDto } from '../../dto/Client.dto';
import { ClientAppMapper } from '../../mappers/Client.mapper';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';

export type GetClientsByCropUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientsByCropUseCase extends AbstractUseCase<
    { engineerId: string; crop: string },
    GetClientsByCropUseCaseExceptions,
    ClientDto[]
> {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
    ) {
        super();
    }

    private mapStringToCrop(cropString: string): Crop | null {
        const normalizedCrop = cropString.toUpperCase().trim();

        const cropMapping = {
            SOJA: Crop.SOYBEAN,
            SOYBEAN: Crop.SOYBEAN,
            MILHO: Crop.CORN,
            CORN: Crop.CORN,
            TRIGO: Crop.WHEAT,
            WHEAT: Crop.WHEAT,
        };

        return cropMapping[normalizedCrop] || null;
    }

    async onExecute({
        engineerId,
        crop,
    }: {
        engineerId: string;
        crop: string;
    }): Promise<Result<GetClientsByCropUseCaseExceptions, ClientDto[]>> {
        const engineer = await this.engineerRepository.getByUserId(engineerId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        const mappedCrop = this.mapStringToCrop(crop);
        if (!mappedCrop) {
            return Res.failure(new BusinessException(`Invalid crop: ${crop}`));
        }

        const clients = await this.engineerRepository.getClientsByCrop(
            engineer.value.id,
            mappedCrop,
        );
        if (clients.isFailure()) {
            return Res.failure(clients.error);
        }

        return Res.success(
            clients.value.map((client) => ClientAppMapper.toDto(client)),
        );
    }
}
