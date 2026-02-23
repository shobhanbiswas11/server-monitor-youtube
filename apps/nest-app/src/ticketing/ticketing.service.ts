import {
  AnomalySeverity,
  AnomalyStatus,
  LogAnalysisJobsService,
} from '@/log-analysis';
import { AnomalyCreatedEvent, TicketCreatedEvent } from '@/shared/events';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 as EventEmitter, OnEvent } from '@nestjs/event-emitter';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { TicketSeverity } from './ticketing.types';

@Injectable()
export class TicketingService {
  constructor(
    private readonly ticketingProviderFactory: TicketingProviderFactory,
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  @OnEvent(AnomalyCreatedEvent.name)
  async handleAnomalyCreatedEvent(event: AnomalyCreatedEvent) {
    const { anomalyId, jobId } = event.payload;

    const providerConfig =
      await this.logAnalysisJobsService.getTicketingSystemConfig(jobId);
    // If provider config & type is not set, return early
    if (!providerConfig?.type) {
      return;
    }

    const provider = this.ticketingProviderFactory.create(providerConfig);
    const anomaly = await this.logAnalysisJobsService.getAnomaly(anomalyId);

    if (!anomaly || anomaly.status !== AnomalyStatus.OPEN) {
      return;
    }

    await provider.createTicket({
      title: anomaly.title,
      description: anomaly.description,
      severity: this.mapAnomalySeverityToTicketSeverity(anomaly.severity),
    });

    this.eventEmitter.emit(
      TicketCreatedEvent.name,
      new TicketCreatedEvent({
        anomalyId,
      }),
    );
  }

  private mapAnomalySeverityToTicketSeverity(
    severity: AnomalySeverity,
  ): TicketSeverity {
    switch (severity) {
      case AnomalySeverity.LOW:
        return TicketSeverity.LOW;
      case AnomalySeverity.MEDIUM:
        return TicketSeverity.MEDIUM;
      case AnomalySeverity.HIGH:
        return TicketSeverity.HIGH;
      default:
        return TicketSeverity.LOW;
    }
  }
}
