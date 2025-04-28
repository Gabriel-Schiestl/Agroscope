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

export function getStatus(status: ReportStatus): string {
  switch (status) {
    case ReportStatus.DRAFT:
      return "Rascunho";
    case ReportStatus.PENDING:
      return "Pendente";
    case ReportStatus.SENT:
      return "Enviado";
    default:
      return "Desconhecido";
  }
}
