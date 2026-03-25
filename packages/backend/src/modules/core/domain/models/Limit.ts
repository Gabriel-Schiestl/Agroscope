import { v4 as uuid } from 'uuid';

export interface LimitProps {
    userId: string;
    imageCount: number;
    chatCount: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export interface CreateLimitProps {
    userId: string;
    imageCount?: number;
    chatCount?: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export interface LoadLimitProps {
    userId: string;
    imageCount: number;
    chatCount: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export class Limit {
    _id: string;
    _userId: string;
    _imageCount: number;
    _chatCount: number;
    _lastAnalysis?: Date;
    _lastMessage?: Date;

    private constructor(props: LimitProps, id?: string) {
        this._id = id || uuid();
        this._userId = props.userId;
        this._imageCount = props.imageCount;
        this._chatCount = props.chatCount;
        this._lastAnalysis = props.lastAnalysis;
        this._lastMessage = props.lastMessage;
    }

    static create(props: CreateLimitProps): Limit {
        return new Limit({
            userId: props.userId,
            imageCount: props.imageCount ?? 0,
            chatCount: props.chatCount ?? 0,
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

    get imageCount(): number {
        return this._imageCount;
    }

    get chatCount(): number {
        return this._chatCount;
    }

    get lastAnalysis(): Date {
        return this._lastAnalysis;
    }

    get lastMessage(): Date {
        return this._lastMessage;
    }

    incrementImageCount(): void {
        this._imageCount++;
    }

    incrementChatCount(): void {
        this._chatCount++;
    }

    setLastAnalysis(date: Date): void {
        this._lastAnalysis = date;
    }

    setLastMessage(date: Date): void {
        this._lastMessage = date;
    }
}
