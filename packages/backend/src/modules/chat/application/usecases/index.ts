import { GetChatHistoryUseCase } from './GetChatHistory.usecase';
import { GetUserSessionsUseCase } from './GetUserSessions.usecase';
import { SendMessageUseCase } from './SendMessage.usecase';

export const chatUseCases = [
    SendMessageUseCase,
    GetChatHistoryUseCase,
    GetUserSessionsUseCase,
];
