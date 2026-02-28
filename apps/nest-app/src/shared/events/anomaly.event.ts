import { AppEvent } from './app-event';

export interface AnomalyCreatedEventPayload {
  anomalyId: string;
}

export class AnomalyCreatedEvent extends AppEvent<AnomalyCreatedEventPayload> {}
