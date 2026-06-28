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
        return await this.getAllPlansQuery.execute();
    }
}
