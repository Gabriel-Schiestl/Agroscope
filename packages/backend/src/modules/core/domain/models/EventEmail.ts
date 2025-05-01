export interface EventEmailProps<T> {
    to: string;
    subject: string;
    templateId: number;
    params?: Record<string, T>;
}

export class EventEmail<T> {
    to: string;
    subject: string;
    templateId: number;
    params?: Record<string, T>;

    constructor(props: EventEmailProps<T>) {
        this.to = props.to;
        this.subject = props.subject;
        this.templateId = props.templateId;
        this.params = props.params;
    }
}
