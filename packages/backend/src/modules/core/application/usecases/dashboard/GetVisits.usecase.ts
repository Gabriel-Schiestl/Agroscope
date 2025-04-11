import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ClientDto } from '../../dto/Client.dto';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { AgriculturalEngineerAppMapper } from '../../mappers/AgriculturalEngineer.mapper';
import { AgriculturalEngineerDto } from '../../dto/AgriculturalEngineer.dto';

export type GetVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetVisitsUseCase {
    constructor(
        @Inject('EngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
    ) {}

    async execute(
        engineerId: string,
        clientId: string,
    ): Promise<Result<GetVisitsUseCaseExceptions, AgriculturalEngineerDto>> {
        const engineer = await this.engineerRepository.getVisits(
            engineerId,
            clientId,
        );
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        if (!engineer.value.clients.length) {
            return Res.failure(new RepositoryNoDataFound('No clients found'));
        }

        if (!engineer.value.clients[0].visits.length) {
            return Res.failure(new RepositoryNoDataFound('No visits found'));
        }

        return Res.success(AgriculturalEngineerAppMapper.toDto(engineer.value));
    }
}
