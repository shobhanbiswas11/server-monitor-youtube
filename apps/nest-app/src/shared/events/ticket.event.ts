import { AppEvent } from './app-event';

export interface TicketCreatedEventPayload {
  anomalyId: string;
}

export class TicketCreatedEvent extends AppEvent<TicketCreatedEventPayload> {}
