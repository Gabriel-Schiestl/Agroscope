import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuid } from 'uuid';

export type ChatMessageSender = 'human' | 'ai';

export interface ChatMessageProps {
    content: string;
    sender: ChatMessageSender;
    userId: string;
    sessionId: string;
    createdAt: Date;
}

export interface CreateChatMessageProps {
    content: string;
    sender: ChatMessageSender;
    userId: string;
    sessionId: string;
}

export interface LoadChatMessageProps extends ChatMessageProps {}

export class ChatMessage implements ChatMessageProps {
    #id: string;
    #content: string;
    #sender: ChatMessageSender;
    #userId: string;
    #sessionId: string;
    #createdAt: Date;

    private constructor(props: ChatMessageProps, id?: string) {
        this.#id = id || uuid();
        this.#content = props.content;
        this.#sender = props.sender;
        this.#userId = props.userId;
        this.#sessionId = props.sessionId;
        this.#createdAt = props.createdAt;
    }

    static create(
        props: CreateChatMessageProps,
    ): Result<BusinessException, ChatMessage> {
        if (!props.content) {
            return Res.failure(
                new BusinessException('O conteúdo da mensagem é obrigatório'),
            );
        }
        if (!props.userId) {
            return Res.failure(new BusinessException('O userId é obrigatório'));
        }
        if (!props.sessionId) {
            return Res.failure(
                new BusinessException('O sessionId é obrigatório'),
            );
        }

        return Res.success(
            new ChatMessage({ ...props, createdAt: new Date() }),
        );
    }

    static load(props: LoadChatMessageProps, id: string): ChatMessage {
        return new ChatMessage(props, id);
    }

    get id() {
        return this.#id;
    }

    get content() {
        return this.#content;
    }

    get sender() {
        return this.#sender;
    }

    get userId() {
        return this.#userId;
    }

    get sessionId() {
        return this.#sessionId;
    }

    get createdAt() {
        return this.#createdAt;
    }
}
