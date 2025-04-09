import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuidv4 } from 'uuid';
import { Report } from './Report';

export enum VisitStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface VisitProps {
    id: string;
    status: VisitStatus;
    notes?: string;
    scheduledDate?: Date;
    reports?: Report[];
    createdAt?: Date;
}

export interface CreateVisitProps extends Omit<VisitProps, 'createdAt' | 'id'> {
    status: VisitStatus;
    notes?: string;
    scheduledDate?: Date;
    reports?: Report[];
}

export interface LoadVisitProps extends Omit<VisitProps, 'id'> {
    status: VisitStatus;
    notes?: string;
    scheduledDate?: Date;
    reports?: Report[];
    createdAt: Date;
}

export class Visit implements VisitProps {
    #id: string;
    #status: VisitStatus;
    #scheduledDate?: Date;
    #notes?: string;
    #reports?: Report[];
    #createdAt?: Date;

    private constructor(props: CreateVisitProps, id?: string) {
        this.#id = id ?? uuidv4();
        this.#status = props.status;
        this.#notes = props.notes;
        this.#scheduledDate = props.scheduledDate;
        this.#reports = props.reports;
        this.#createdAt = new Date();
    }

    static create(props: CreateVisitProps): Result<BusinessException, Visit> {
        if (!props.status) {
            return Res.failure(
                new BusinessException('Scheduled date and status are required'),
            );
        }
        return Res.success(new Visit(props));
    }

    static load(props: LoadVisitProps, id: string): Visit {
        return new Visit(props, id);
    }

    get id(): string {
        return this.#id;
    }

    get status(): VisitStatus {
        return this.#status;
    }

    get notes(): string | undefined {
        return this.#notes;
    }

    get scheduledDate(): Date | undefined {
        return this.#scheduledDate;
    }

    get createdAt(): Date | undefined {
        return this.#createdAt;
    }

    get reports(): Report[] | undefined {
        return this.#reports;
    }
}
