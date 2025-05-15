import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { EngineerGuard } from 'src/shared/infra/services/Engineer.guard';
import { GetEventsUseCase } from '../application/usecases/GetEvents.usecase';
import { GetEventsByClientUseCase } from '../application/usecases/GetEventsByClient.usecase';
import { GetLastEventsUseCase } from '../application/usecases/GetLastEvents.usecase';
import { CreateEventUseCase } from '../application/usecases/CreateEvent.usecase';
import { CreateCalendarEventDto } from '../application/dto/CalendarEvent.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateCalendarUseCase } from '../application/usecases/CreateCalendar.usecase';
import { UserDto } from '../application/dto/User.dto';

@UseGuards(EngineerGuard)
@Controller('calendar')
export class CalendarController {
    constructor(
        private readonly getLastEventsUseCase: GetLastEventsUseCase,
        private readonly getEventsByClientUseCase: GetEventsByClientUseCase,
        private readonly getEventsUseCase: GetEventsUseCase,
        private readonly createEventUseCase: CreateEventUseCase,
        private readonly createCalendarUseCase: CreateCalendarUseCase,
    ) {}

    @Get('events')
    async getAllEvents(@Req() req: any) {
        return await this.getEventsUseCase.execute({
            userId: req.user.sub,
        });
    }

    @Get('events/:clientId')
    async getEvents(@Param('clientId') clientId: string, @Req() req: any) {
        return await this.getEventsByClientUseCase.execute({
            clientId,
            userId: req.user.sub,
        });
    }

    @Get('last-events')
    async getLastVisits(@Req() req: any) {
        return await this.getLastEventsUseCase.execute({
            userId: req.user.sub,
        });
    }

    @Post('event')
    async createEvent(@Body() event: CreateCalendarEventDto, @Req() req: any) {
        const userId = req.user.id;
        const result = await this.createEventUseCase.execute({
            eventDto: event,
            userId,
        });

        return result;
    }

    @OnEvent('user.created')
    async handleUserCreatedEvent(user: UserDto) {
        this.createCalendarUseCase.execute({ userId: user.id });
    }
}
