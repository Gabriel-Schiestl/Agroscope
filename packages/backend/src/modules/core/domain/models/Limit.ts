import { v4 as uuid } from 'uuid';

export interface LimitProps {
    userId: string;
    imageRequests: number;
    chatRequests: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export interface CreateLimitProps {
    userId: string;
    imageRequests?: number;
    chatRequests?: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export interface LoadLimitProps {
    userId: string;
    imageRequests: number;
    chatRequests: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export class Limit {
    _id: string;
    _userId: string;
    _imageRequests: number;
    _chatRequests: number;
    _lastAnalysis?: Date;
    _lastMessage?: Date;

    private constructor(props: LimitProps, id?: string) {
        this._id = id || uuid();
        this._userId = props.userId;
        this._imageRequests = props.imageRequests;
        this._chatRequests = props.chatRequests;
        this._lastAnalysis = props.lastAnalysis;
        this._lastMessage = props.lastMessage;
    }

    static create(props: CreateLimitProps): Limit {
        return new Limit({
            userId: props.userId,
            imageRequests: props.imageRequests ?? 0,
            chatRequests: props.chatRequests ?? 0,
            lastAnalysis: props.lastAnalysis,
            lastMessage: props.lastMessage,
        });
    }

    static load(props: LoadLimitProps, id: string): Limit {
        return new Limit(props, id);
    }

    get id(): string {
        return this._id;
    }

    get userId(): string {
        return this._userId;
    }

    get imageRequests(): number {
        return this._imageRequests;
    }

    get chatRequests(): number {
        return this._chatRequests;
    }

    get lastAnalysis(): Date {
        return this._lastAnalysis;
    }

    get lastMessage(): Date {
        return this._lastMessage;
    }

    incrementImageRequests(): void {
        this._imageRequests++;
    }

    incrementChatRequests(): void {
        this._chatRequests++;
    }

    setLastAnalysis(date: Date): void {
        this._lastAnalysis = date;
    }

    setLastMessage(date: Date): void {
        this._lastMessage = date;
    }
}
