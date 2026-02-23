import { TicketSeverity, TicketStatus } from '@/ticketing';
import { Injectable } from '@nestjs/common';

export interface TicketCreationContext {
  ticket: {
    id: string;
    title: string;
    description: string;
    severity: TicketSeverity;
    status: TicketStatus;
  };
  server: {
    isConfigured: boolean;
    shhConfiguration: {
      host: string;
      username: string;
      privateKey: string;
    };
  };
}

@Injectable()
export class TicketCreationContextQuery {
  execute(anomalyId: string): Promise<TicketCreationContext> {
    throw new Error('Not implemented');
  }
}
