/**
 * Enum para status do relatório
 */
export enum ReportStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  SENT = "SENT",
}

/**
 * Interface para relatório
 */
export interface Report {
  id: string;
  title: string;
  content: string;
  status: ReportStatus;
  attachments?: string[];
  createdAt?: Date;
}
