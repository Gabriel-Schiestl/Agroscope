import { Injectable } from '@nestjs/common';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { ChatMessage } from '../../domain/models/ChatMessage';
import {
    ChatMessageRepository,
    ChatMessageRepositoryExceptions,
} from '../../domain/repositories/ChatMessage.repository';
import { ChatMessageMapper } from '../mappers/ChatMessage.mapper';
import { ChatMessageModel } from '../models/ChatMessage.model';

@Injectable()
export class ChatMessageDataRepository implements ChatMessageRepository {
    async save(
        message: ChatMessage,
    ): Promise<Result<ChatMessageRepositoryExceptions, void>> {
        try {
            const model = ChatMessageMapper.domainToModel(message);
            await model.save();
            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getBySession(
        sessionId: string,
        userId: string,
    ): Promise<Result<ChatMessageRepositoryExceptions, ChatMessage[]>> {
        try {
            const models = await ChatMessageModel.find({
                where: { sessionId, userId },
                order: { createdAt: 'ASC' },
            });

            return Res.success(models.map(ChatMessageMapper.modelToDomain));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getLastBySession(
        sessionId: string,
        userId: string,
        limit: number,
    ): Promise<Result<ChatMessageRepositoryExceptions, ChatMessage[]>> {
        try {
            const models = await ChatMessageModel.find({
                where: { sessionId, userId },
                order: { createdAt: 'DESC' },
                take: limit,
            });

            return Res.success(
                models.reverse().map(ChatMessageMapper.modelToDomain),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getSessionsByUser(
        userId: string,
    ): Promise<Result<ChatMessageRepositoryExceptions, string[]>> {
        try {
            const rows = await ChatMessageModel.createQueryBuilder('msg')
                .select('DISTINCT msg.session_id', 'sessionId')
                .where('msg.user_id = :userId', { userId })
                .orderBy('MAX(msg.created_at)', 'DESC')
                .groupBy('msg.session_id')
                .getRawMany<{ sessionId: string }>();

            return Res.success(rows.map((r) => r.sessionId));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }
}
