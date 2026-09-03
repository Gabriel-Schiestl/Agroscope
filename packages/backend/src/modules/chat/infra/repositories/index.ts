import { ChatMessageDataRepository } from './ChatMessageData.repository';

export const chatRepositories = [
    {
        provide: 'ChatMessageRepository',
        useClass: ChatMessageDataRepository,
    },
];
