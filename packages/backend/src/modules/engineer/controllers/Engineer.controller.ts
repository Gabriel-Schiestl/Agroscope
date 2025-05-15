import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { GetClientsUseCase } from '../application/usecases/GetClients.usecase';
import { CreateClientUseCase } from '../application/usecases/CreateClient.usecase';
import { GetClientsByCropUseCase } from '../application/usecases/GetClientsByCrop.usecase';
import { GetClientUseCase } from '../application/usecases/GetClient.usecase';
import { EngineerGuard } from 'src/shared/infra/services/Engineer.guard';
import { CreateClientDto } from '../application/dto/Client.dto';

@UseGuards(EngineerGuard)
@Controller('engineer')
export class EngineerController {
    constructor(
        private readonly getClientsUseCase: GetClientsUseCase,
        private readonly createClientUseCase: CreateClientUseCase,
        private readonly getClientsByCropUseCase: GetClientsByCropUseCase,
        private readonly getClientUseCase: GetClientUseCase,
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

    @Post('client')
    async createClient(@Req() req: any, @Body() clientDto: CreateClientDto) {
        return await this.createClientUseCase.execute({
            clientDto,
            engineerId: req.user.sub,
        });
    }

    @Get('clients-by-crop/:crop')
    async getClientsByCrop(@Req() req: any, @Param('crop') crop: string) {
        return await this.getClientsByCropUseCase.execute({
            crop,
            userId: req.user.sub,
        });
    }
}
