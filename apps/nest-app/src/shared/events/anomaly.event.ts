import { AppEvent } from './app-event';

export interface AnomalyCreatedEventPayload {
  ownerId: string;
  jobId: string;
  anomalyId: string;
}

export class AnomalyCreatedEvent extends AppEvent<AnomalyCreatedEventPayload> {}
