import { Controller, Get, Query, Req } from '@nestjs/common';
import { GetChatHistoryUseCase } from '../application/usecases/GetChatHistory.usecase';
import { GetUserSessionsUseCase } from '../application/usecases/GetUserSessions.usecase';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly getChatHistoryUseCase: GetChatHistoryUseCase,
        private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    ) {}

    @Get('history')
    async getHistory(@Query('sessionId') sessionId: string, @Req() req) {
        return this.getChatHistoryUseCase.execute({
            sessionId,
            userId: req['user'].sub,
        });
    }

    @Get('sessions')
    async getSessions(@Req() req) {
        return this.getUserSessionsUseCase.execute({
            userId: req['user'].sub,
        });
    }
}
