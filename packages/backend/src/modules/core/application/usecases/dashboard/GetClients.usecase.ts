import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ClientDto } from '../../dto/Client.dto';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { AgriculturalEngineerAppMapper } from '../../mappers/AgriculturalEngineer.mapper';
import { AgriculturalEngineerDto } from '../../dto/AgriculturalEngineer.dto';

export type GetClientesUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientesUseCase {
    constructor(
        @Inject('EngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
    ) {}

    async execute(
        engineerId: string,
    ): Promise<Result<GetClientesUseCaseExceptions, AgriculturalEngineerDto>> {
        const engineer =
            await this.engineerRepository.getWithClients(engineerId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        if (!engineer.value.clients || engineer.value.clients.length === 0) {
            return Res.failure(new RepositoryNoDataFound('No clients found'));
        }

        return Res.success(AgriculturalEngineerAppMapper.toDto(engineer.value));
    }
}
