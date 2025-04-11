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

@UseGuards(EngineerGuard)
@Controller('engineer')
export class EngineerController {
    constructor(
        private readonly getClientsUseCase: GetClientesUseCase,
        private readonly getVisitsUseCase: GetVisitsUseCase,
        private readonly getReportsUseCase: GetReportsUseCase,
        private readonly getLastVisitsUseCase: GetLastVisitsUseCase,
        private readonly createClientUseCase: CreateClientUseCase,
    ) {}

    @Get('clients')
    async getClients(@Req() req: any) {
        return await this.getClientsUseCase.execute(req.user.id);
    }

    @Get('visits/:clientId')
    async getVisits(@Req() req: any, @Param('clientId') clientId: string) {
        return await this.getVisitsUseCase.execute(req.user.id, clientId);
    }

    @Get('reports/:clientId/:visitId')
    async getReports(
        @Req() req: any,
        @Param('clientId') clientId: string,
        @Param('visitId') visitId: string,
    ) {
        return await this.getReportsUseCase.execute(
            req.user.id,
            clientId,
            visitId,
        );
    }

    @Get('last-visits')
    async getLastVisits(@Req() req: any) {
        return await this.getLastVisitsUseCase.execute(req.user.id);
    }

    @Post('client')
    async createClient(@Req() req: any, @Body() clientDto: CreateClientDto) {
        return await this.createClientUseCase.execute(req.user.id, clientDto);
    }
}
