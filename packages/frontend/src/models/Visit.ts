/**
 * Enum para status da visita
 */
export enum VisitStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/**
 * Interface para visita
 */
export interface Visit {
  id: string;
  status: VisitStatus;
  notes?: string;
  scheduledDate?: Date;
  reports?: Report[];
  createdAt?: Date;
}
