import { v4 as uuid } from 'uuid';
import { Sickness } from './Sickness';

export interface HistoryProps {
    createdAt: Date;
    sickness?: Sickness;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling?: string;
    image: string;
    clientId?: string;
    userId?: string;
}

export interface CreateHistoryProps {
    sickness?: Sickness;
    handling?: string;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    image: string;
    clientId?: string;
    userId?: string;
}

export interface LoadHistoryProps {
    createdAt: Date;
    sickness?: Sickness;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling?: string;
    image: string;
    clientId?: string;
    userId?: string;
}

export class History {
    _id: string;
    _createdAt: Date;
    _sickness: Sickness;
    _sicknessConfidence?: number;
    _crop: string;
    _cropConfidence: number;
    _handling: string;
    _image: string;
    _clientId?: string;
    _userId?: string;

    private constructor(props: HistoryProps, id?: string) {
        this._id = id || uuid();
        this._createdAt = props.createdAt;
        this._sickness = props.sickness;
        this._sicknessConfidence = props.sicknessConfidence;
        this._crop = props.crop;
        this._cropConfidence = props.cropConfidence;
        this._handling = props.handling;
        this._image = props.image;
        this._clientId = props.clientId;
        this._userId = props.userId;
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

    get sickness(): Sickness {
        return this._sickness;
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

    get clientId(): string {
        return this._clientId;
    }

    get userId(): string {
        return this._userId;
    }
}
