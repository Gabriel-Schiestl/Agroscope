import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { ClientDto } from '../dto/Client.dto';
import { AgriculturalEngineerRepository } from '../../domain/repositories/AgriculturalEngineer.repository';
import { Crop } from '../../domain/models/Client';
import { ClientAppMapper } from '../mappers/Client.mapper';

export type GetClientsByCropUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientsByCropUseCase extends AbstractUseCase<
    { userId: string; crop: string },
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
        userId,
        crop,
    }: {
        userId: string;
        crop: string;
    }): Promise<Result<GetClientsByCropUseCaseExceptions, ClientDto[]>> {
        const engineer = await this.engineerRepository.getByUserId(userId);
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
