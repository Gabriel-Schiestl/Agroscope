import { v4 as uuid } from 'uuid';
import { Sickness } from './Sickness';

export interface HistoryProps {
    id: string;
    createdAt: Date;
    sickness: Sickness;
    handling: string;
    image: string;
    clientId?: string;
    userId?: string;
}

export interface CreateHistoryProps {
    sickness?: Sickness;
    handling?: string;
    image: string;
    clientId?: string;
    userId?: string;
}

export interface LoadHistoryProps {
    createdAt: Date;
    sickness: Sickness;
    handling?: string;
    image: string;
    clientId?: string;
    userId?: string;
}

export class History {
    _id: string;
    _createdAt: Date;
    _sickness: Sickness;
    _handling: string;
    _image: string;
    _clientId?: string;
    _userId?: string;

    private constructor(props: CreateHistoryProps, id?: string) {
        this._id = id || uuid();
        this._createdAt = new Date();
        this._sickness = props.sickness;
        this._handling = props.handling;
        this._image = props.image;
        this._clientId = props.clientId;
        this._userId = props.userId;
    }

    static create(props: CreateHistoryProps): History {
        return new History(props);
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
