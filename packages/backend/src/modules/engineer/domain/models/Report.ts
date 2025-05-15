export enum ReportStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    SENT = 'SENT',
}

export interface Report {
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
