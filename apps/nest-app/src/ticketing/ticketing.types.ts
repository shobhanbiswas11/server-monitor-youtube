export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

export enum TicketSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface TicketCreate {
  title: string;
  description?: string;
  severity: TicketSeverity;
}

export interface Ticket extends TicketCreate {
  id: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}
