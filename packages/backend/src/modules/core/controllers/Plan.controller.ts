import { Controller, Get } from '@nestjs/common';
import { Public } from 'PublicRoutes';
import { GetAllPlansQuery } from '../application/query/GetAllPlans.query';
import { PlanAppMapper } from '../application/mappers/Plan.mapper';

@Controller('plan')
export class PlanController {
    constructor(private readonly getAllPlansQuery: GetAllPlansQuery) {}

    @Public()
    @Get()
    async getAllPlans() {
        const result = await this.getAllPlansQuery.execute();

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.value,
            };
        }

        return result;
    }
}
