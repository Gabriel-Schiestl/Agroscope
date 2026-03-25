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
    _id: string;
    _createdAt: Date;
    _sicknessId?: string;
    _sicknessConfidence?: number;
    _crop: string;
    _cropConfidence: number;
    _handling: string;
    _image: string;
    _explanation?: string;
    _userId?: string;
    _causes?: string;

    private constructor(props: HistoryProps, id?: string) {
        this._id = id || uuid();
        this._createdAt = props.createdAt;
        this._sicknessId = props.sicknessId;
        this._sicknessConfidence = props.sicknessConfidence;
        this._crop = props.crop;
        this._cropConfidence = props.cropConfidence;
        this._handling = props.handling;
        this._image = props.image;
        this._explanation = props.explanation;
        this._userId = props.userId;
        this._causes = props.causes;
    }

    static create(props: CreateHistoryProps): History {
        return new History({ ...props, createdAt: new Date() });
    }

    static load(props: LoadHistoryProps, id: string): History {
        return new History(props, id);
    }

    get id(): string {
        return this._id;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get sicknessId(): string {
        return this._sicknessId;
    }

    get sicknessConfidence(): number {
        return this._sicknessConfidence;
    }

    get crop(): string {
        return this._crop;
    }

    get cropConfidence(): number {
        return this._cropConfidence;
    }

    get handling(): string {
        return this._handling;
    }

    get image(): string {
        return this._image;
    }

    get explanation(): string {
        return this._explanation;
    }

    get userId(): string {
        return this._userId;
    }

    get causes(): string {
        return this._causes;
    }
}
