import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { ChatMessage } from '../models/ChatMessage';

export type ChatMessageRepositoryExceptions =
    | TechnicalException
    | RepositoryNoDataFound;

export interface ChatMessageRepository {
    save(message: ChatMessage): Promise<Result<ChatMessageRepositoryExceptions, void>>;
    getBySession(
        sessionId: string,
        userId: string,
    ): Promise<Result<ChatMessageRepositoryExceptions, ChatMessage[]>>;
    getLastBySession(
        sessionId: string,
        userId: string,
        limit: number,
    ): Promise<Result<ChatMessageRepositoryExceptions, ChatMessage[]>>;
    getSessionsByUser(
        userId: string,
    ): Promise<Result<ChatMessageRepositoryExceptions, string[]>>;
}
