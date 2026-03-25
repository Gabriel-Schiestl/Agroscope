import { Inject, Injectable } from '@nestjs/common';
import { PlanRepository } from '../../domain/repositories/Plan.repository';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { PlanDto } from '../dto/Plan.dto';
import { PlanAppMapper } from '../mappers/Plan.mapper';

@Injectable()
export class GetAllPlansQuery {
    constructor(
        @Inject('PlanRepository')
        private readonly planRepository: PlanRepository,
    ) {}

    async execute(): Promise<Result<TechnicalException, PlanDto[]>> {
        const result = await this.planRepository.getAll();
        if (result.isFailure()) return Res.failure(result.error);

        return Res.success(
            result.value.map((plan) => PlanAppMapper.toDto(plan)),
        );
    }
}
