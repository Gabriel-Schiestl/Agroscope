import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuidv4 } from 'uuid';

export enum ReportStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    SENT = 'SENT',
}

export interface ReportProps {
    id: string;
    title: string;
    content: string;
    status: ReportStatus;
    clientId: string;
    engineerId: string;
    attachments?: string[];
    visitId?: string;
    createdAt?: Date;
}

export interface CreateReportProps
    extends Omit<ReportProps, 'createdAt' | 'id'> {
    title: string;
    content: string;
    status: ReportStatus;
    clientId: string;
    engineerId: string;
    attachments?: string[];
    visitId?: string;
    createdAt?: Date;
}

export interface LoadReportProps extends Omit<ReportProps, 'id'> {
    title: string;
    content: string;
    status: ReportStatus;
    clientId: string;
    engineerId: string;
    attachments?: string[];
    visitId?: string;
    createdAt: Date;
}

export class Report implements ReportProps {
    #id: string;
    #title: string;
    #content: string;
    #status: ReportStatus;
    #engineerId: string;
    #clientId: string;
    #attachments?: string[];
    #visitId?: string;
    #createdAt?: Date;

    private constructor(props: CreateReportProps, id?: string) {
        this.#id = id ?? uuidv4();
        this.#title = props.title;
        this.#content = props.content;
        this.#status = props.status;
        this.#clientId = props.clientId;
        this.#engineerId = props.engineerId;
        this.#attachments = props.attachments;
        this.#visitId = props.visitId;
        this.#createdAt = props.createdAt ?? new Date();
    }

    static create(props: CreateReportProps): Result<BusinessException, Report> {
        if (
            !props.title ||
            !props.content ||
            !props.status ||
            !props.engineerId ||
            !props.clientId
        ) {
            return Res.failure(
                new BusinessException(
                    'Title, content, engineer id, client id and status are required',
                ),
            );
        }
        return Res.success(new Report(props));
    }

    static load(props: LoadReportProps, id: string): Report {
        return new Report(props, id);
    }

    get id(): string {
        return this.#id;
    }

    get title(): string {
        return this.#title;
    }

    get content(): string {
        return this.#content;
    }

    get status(): ReportStatus {
        return this.#status;
    }

    get clientId(): string {
        return this.#clientId;
    }

    get engineerId(): string {
        return this.#engineerId;
    }

    get attachments(): string[] | undefined {
        return this.#attachments;
    }

    get visitId(): string | undefined {
        return this.#visitId;
    }

    get createdAt(): Date | undefined {
        return this.#createdAt;
    }
}
