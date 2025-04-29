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
import { GetReportsUseCase } from '../application/usecases/dashboard/GetReports.usecase';
import { EngineerGuard } from '../infra/services/Engineer.guard';
import { CreateClientDto } from '../application/dto/Client.dto';
import { CreateClientUseCase } from '../application/usecases/engineer/CreateClient.usecase';
import { GetClientsByCropUseCase } from '../application/usecases/dashboard/GetClientsByCrop.usecase';
import { GetAllReportsUseCase } from '../application/usecases/dashboard/GetAllReports.usecase';
import { GetClientUseCase } from '../application/usecases/dashboard/GetClient.usecase';
import { GetLastEventsUseCase } from '../application/usecases/dashboard/GetLastEvents.usecase';
import { GetEventsUseCase } from '../application/usecases/dashboard/GetEvents.usecase';

@UseGuards(EngineerGuard)
@Controller('engineer')
export class EngineerController {
    constructor(
        private readonly getClientsUseCase: GetClientesUseCase,
        private readonly getReportsUseCase: GetReportsUseCase,
        private readonly getLastEventsUseCase: GetLastEventsUseCase,
        private readonly createClientUseCase: CreateClientUseCase,
        private readonly getClientsByCropUseCase: GetClientsByCropUseCase,
        private readonly getAllReportsUseCase: GetAllReportsUseCase,
        private readonly getClientUseCase: GetClientUseCase,
        private readonly getEventsUseCase: GetEventsUseCase,
    ) {}

    @Get('clients')
    async getClients(@Req() req: any) {
        return await this.getClientsUseCase.execute({
            userId: req.user.sub,
        });
    }

    @Get('clients/:clientId')
    async getClient(@Param('clientId') clientId: string, @Req() req: any) {
        return await this.getClientUseCase.execute({
            userId: req.user.sub,
            clientId,
        });
    }

    @Get('visits/:clientId')
    async getVisits(@Param('clientId') clientId: string, @Req() req: any) {
        return await this.getEventsUseCase.execute({
            clientId,
            userId: req.user.sub,
        });
    }

    @Get('reports/:eventId')
    async getReports(@Param('eventId') eventId: string) {
        return await this.getReportsUseCase.execute({ eventId });
    }

    @Get('last-events')
    async getLastVisits(@Req() req: any) {
        return await this.getLastEventsUseCase.execute({
            userId: req.user.sub,
        });
    }

    @Post('client')
    async createClient(@Req() req: any, @Body() clientDto: CreateClientDto) {
        return await this.createClientUseCase.execute({
            clientDto,
            engineerId: req.user.sub,
        });
    }

    @Get('clients/:crop')
    async getClientsByCrop(@Req() req: any, @Param('crop') crop: string) {
        return await this.getClientsByCropUseCase.execute({
            crop,
            userId: req.user.sub,
        });
    }

    @Get('reports')
    async getAllReports(@Req() req: any) {
        return await this.getAllReportsUseCase.execute({
            userId: req.user.sub,
        });
    }

    // @Get('dashboard/overview')
    // async getDashboardOverview(@Req() req: any) {
    //     return await this.getDashboardOverviewUseCase.execute(req.user.id);
    // }
}
