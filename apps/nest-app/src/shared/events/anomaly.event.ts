import { Anomaly } from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';
import { LogAnalysisJob } from '@/log-analysis/log-analysis-jobs/entities/log-analysis-job.entity';
import { AppEvent } from './app-event';

export interface AnomalyCreatedEventPayload {
  anomaly: Anomaly;
  job: LogAnalysisJob;
}

export class AnomalyCreatedEvent extends AppEvent<AnomalyCreatedEventPayload> {}
