import { v4 as uuid } from 'uuid';

export interface LimitProps {
    imageRequests: number;
    chatRequests: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export interface LoadLimitProps {
    imageRequests: number;
    chatRequests: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

export class Limit {
    #id: string;
    #imageRequests: number;
    #chatRequests: number;
    #lastAnalysis?: Date;
    #lastMessage?: Date;

    private constructor(props: LimitProps, id?: string) {
        this.#id = id || uuid();
        this.#imageRequests = props.imageRequests;
        this.#chatRequests = props.chatRequests;
        this.#lastAnalysis = props.lastAnalysis;
        this.#lastMessage = props.lastMessage;
    }

    static create(): Limit {
        return new Limit({
            imageRequests: 0,
            chatRequests: 0,
        });
    }

    static load(props: LoadLimitProps, id: string): Limit {
        return new Limit(props, id);
    }

    get id(): string {
        return this.#id;
    }

    get imageRequests(): number {
        return this.#imageRequests;
    }

    get chatRequests(): number {
        return this.#chatRequests;
    }

    get lastAnalysis(): Date {
        return this.#lastAnalysis;
    }

    get lastMessage(): Date {
        return this.#lastMessage;
    }

    incrementImageRequests(): void {
        this.#imageRequests++;
    }

    incrementChatRequests(): void {
        this.#chatRequests++;
    }

    setLastAnalysis(date: Date): void {
        this.#lastAnalysis = date;
    }

    setLastMessage(date: Date): void {
        this.#lastMessage = date;
    }
}
