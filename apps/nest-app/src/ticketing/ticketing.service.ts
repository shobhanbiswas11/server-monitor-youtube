import { AnomalySeverity } from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { TicketSeverity } from './ticketing.types';

@Injectable()
export class TicketingService {
  constructor(
    private readonly ticketingProviderFactory: TicketingProviderFactory,
  ) {}

  @OnEvent(AnomalyCreatedEvent.name)
  handleAnomalyCreatedEvent(event: AnomalyCreatedEvent) {
    const providerConfig = event.payload.job.ticketingSystemConfig;
    const anomaly = event.payload.anomaly;

    if (!providerConfig?.providerType) {
      return;
    }
    const provider = this.ticketingProviderFactory.create(providerConfig);
    return provider.createTicket({
      title: anomaly.title,
      description: anomaly.description,
      severity: this.mapAnomalySeverityToTicketSeverity(anomaly.severity),
    });
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
