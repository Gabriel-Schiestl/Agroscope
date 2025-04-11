import { Inject, Injectable } from '@nestjs/common';
import { CreateClientDto } from '../../dto/Client.dto';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';

export type CreateClientUseCaseException = BusinessException;

@Injectable()
export class CreateClientUseCase {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly agriculturalEngineerRepository: AgriculturalEngineerRepository,
    ) {}

    async execute(
        engineerId: string,
        clientDto: CreateClientDto,
    ): Promise<Result<CreateClientUseCaseException, void>> {
        const engineer =
            await this.agriculturalEngineerRepository.getByUserId(engineerId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        const addClientResult = engineer.value.addClient(clientDto);
        if (addClientResult.isFailure()) {
            return Res.failure(addClientResult.error);
        }

        const saveResult = await this.agriculturalEngineerRepository.save(
            engineer.value,
        );
        if (saveResult.isFailure()) {
            return Res.failure(saveResult.error);
        }

        return Res.success();
    }
}
