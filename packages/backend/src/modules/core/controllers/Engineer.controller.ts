import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { GetClientesUseCase } from '../application/usecases/dashboard/GetClients.usecase';
import { GetVisitsUseCase } from '../application/usecases/dashboard/GetVisits.usecase';
import { GetReportsUseCase } from '../application/usecases/dashboard/GetReports.usecase';
import { GetLastVisitsUseCase } from '../application/usecases/dashboard/GetLastVisits.usecase';
import { EngineerGuard } from '../infra/services/Engineer.guard';
import { CreateClientDto } from '../application/dto/Client.dto';
import { CreateClientUseCase } from '../application/usecases/engineer/CreateClient.usecase';
import { GetClientsByCropUseCase } from '../application/usecases/dashboard/GetClientsByCrop.usecase';

@UseGuards(EngineerGuard)
@Controller('engineer')
export class EngineerController {
    constructor(
        private readonly getClientsUseCase: GetClientesUseCase,
        private readonly getVisitsUseCase: GetVisitsUseCase,
        private readonly getReportsUseCase: GetReportsUseCase,
        private readonly getLastVisitsUseCase: GetLastVisitsUseCase,
        private readonly createClientUseCase: CreateClientUseCase,
        private readonly getClientsByCropUseCase: GetClientsByCropUseCase,
    ) {}

    @Get('clients')
    async getClients(@Req() req: any) {
        return await this.getClientsUseCase.execute(req.user.id);
    }

    @Get('visits/:clientId')
    async getVisits(@Param('clientId') clientId: string) {
        return await this.getVisitsUseCase.execute(clientId);
    }

    @Get('reports/:visitId')
    async getReports(@Param('visitId') visitId: string) {
        return await this.getReportsUseCase.execute(visitId);
    }

    @Get('last-visits')
    async getLastVisits(@Req() req: any) {
        return await this.getLastVisitsUseCase.execute(req.user.id);
    }

    @Post('client')
    async createClient(@Req() req: any, @Body() clientDto: CreateClientDto) {
        return await this.createClientUseCase.execute(req.user.id, clientDto);
    }

    @Get('clients/:crop')
    async getClientsByCrop(@Req() req: any, @Param('crop') crop: string) {
        return await this.getClientsByCropUseCase.execute(req.user.id, crop);
    }

    // @Get('dashboard/overview')
    // async getDashboardOverview(@Req() req: any) {
    //     return await this.getDashboardOverviewUseCase.execute(req.user.id);
    // }
}
