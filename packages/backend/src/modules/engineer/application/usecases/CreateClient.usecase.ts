import { Inject, Injectable } from '@nestjs/common';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { CreateClientDto } from '../dto/Client.dto';
import { AgriculturalEngineerRepository } from '../../domain/repositories/AgriculturalEngineer.repository';

export type CreateClientUseCaseException = BusinessException;

@Injectable()
export class CreateClientUseCase extends AbstractUseCase<
    { engineerId: string; clientDto: CreateClientDto },
    CreateClientUseCaseException,
    void
> {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly agriculturalEngineerRepository: AgriculturalEngineerRepository,
    ) {
        super();
    }

    async onExecute({
        clientDto,
        engineerId,
    }: {
        engineerId: string;
        clientDto: CreateClientDto;
    }): Promise<Result<CreateClientUseCaseException, void>> {
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
