import { v4 as uuid } from 'uuid';

export interface HistoryProps {
    createdAt: Date;
    sicknessId?: string;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling?: string;
    image: string;
    explanation?: string;
    userId?: string;
    causes?: string;
}

export interface CreateHistoryProps {
    sicknessId?: string;
    handling?: string;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    image: string;
    explanation?: string;
    userId?: string;
    causes?: string;
}

export interface LoadHistoryProps {
    createdAt: Date;
    sicknessId?: string;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling?: string;
    image: string;
    explanation?: string;
    userId?: string;
    causes?: string;
}

export class History {
    #id: string;
    #createdAt: Date;
    #sicknessId?: string;
    #sicknessConfidence?: number;
    #crop: string;
    #cropConfidence: number;
    #handling: string;
    #image: string;
    #explanation?: string;
    #userId?: string;
    #causes?: string;

    private constructor(props: HistoryProps, id?: string) {
        this.#id = id || uuid();
        this.#createdAt = props.createdAt;
        this.#sicknessId = props.sicknessId;
        this.#sicknessConfidence = props.sicknessConfidence;
        this.#crop = props.crop;
        this.#cropConfidence = props.cropConfidence;
        this.#handling = props.handling;
        this.#image = props.image;
        this.#explanation = props.explanation;
        this.#userId = props.userId;
        this.#causes = props.causes;
    }

    static create(props: CreateHistoryProps): History {
        return new History({ ...props, createdAt: new Date() });
    }

    static load(props: LoadHistoryProps, id: string): History {
        return new History(props, id);
    }

    get id(): string {
        return this.#id;
    }

    get createdAt(): Date {
        return this.#createdAt;
    }

    get sicknessId(): string {
        return this.#sicknessId;
    }

    get sicknessConfidence(): number {
        return this.#sicknessConfidence;
    }

    get crop(): string {
        return this.#crop;
    }

    get cropConfidence(): number {
        return this.#cropConfidence;
    }

    get handling(): string {
        return this.#handling;
    }

    get image(): string {
        return this.#image;
    }

    get explanation(): string {
        return this.#explanation;
    }

    get userId(): string {
        return this.#userId;
    }

    get causes(): string {
        return this.#causes;
    }
}
