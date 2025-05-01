import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuidv4 } from 'uuid';

export enum EventType {
    VISIT = 'visit',
    APPLICATION = 'application',
    COLLECTION = 'collection',
    REPORT = 'report',
    MEETING = 'meeting',
}

export enum EventStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface CalendarEventProps {
    title: string;
    type: EventType;
    status: EventStatus;
    date: Date;
    time: string;
    clientId?: string;
    location?: string;
    description?: string;
    reportId?: string;
}

export interface CreateCalendarEventProps
    extends Omit<CalendarEventProps, 'status' | 'reportId'> {}

export interface LoadCalendarEventProps extends CalendarEventProps {}

export class CalendarEvent implements CalendarEventProps {
    #id: string;
    #title: string;
    #type: EventType;
    #status: EventStatus;
    #date: Date;
    #time: string;
    #clientId?: string;
    #location?: string;
    #description?: string;
    #reportId?: string;

    private constructor(props: CalendarEventProps, id?: string) {
        this.#id = id ?? uuidv4();
        this.#title = props.title;
        this.#type = props.type;
        this.#status = props.status;
        this.#date = props.date;
        this.#time = props.time;
        this.#clientId = props.clientId;
        this.#location = props.location;
        this.#description = props.description;
        this.#reportId = props.reportId;
    }

    static create(
        props: CreateCalendarEventProps,
    ): Result<BusinessException, CalendarEvent> {
        if (!props.title) {
            return Res.failure(new BusinessException('Title is required'));
        }
        if (!props.type) {
            return Res.failure(new BusinessException('Type is required'));
        }
        if (!props.date) {
            return Res.failure(new BusinessException('Date is required'));
        }
        if (!props.time) {
            return Res.failure(new BusinessException('Time is required'));
        }
        if (!props.clientId) {
            return Res.failure(new BusinessException('Client ID is required'));
        }

        return Res.success(
            new CalendarEvent({ ...props, status: EventStatus.PENDING }),
        );
    }

    static load(props: LoadCalendarEventProps, id: string) {
        return new CalendarEvent(props, id);
    }

    update(props: Partial<Omit<CalendarEventProps, 'id' | 'createdAt'>>): void {
        if (props.title) {
            this.#title = props.title;
        }

        if (props.type) {
            this.#type = props.type;
        }

        if (props.date) {
            this.#date = props.date;
        }

        if (props.time) {
            this.#time = props.time;
        }

        if (props.location) {
            this.#location = props.location;
        }

        if (props.description) {
            this.#description = props.description;
        }
    }

    get id(): string {
        return this.#id;
    }

    get title(): string {
        return this.#title;
    }

    get type(): EventType {
        return this.#type;
    }

    get status(): EventStatus {
        return this.#status;
    }

    get date(): Date {
        return this.#date;
    }

    get time(): string {
        return this.#time;
    }

    get clientId(): string | undefined {
        return this.#clientId;
    }

    get location(): string | undefined {
        return this.#location;
    }

    get description(): string | undefined {
        return this.#description;
    }

    get reportId(): string | undefined {
        return this.#reportId;
    }
}
