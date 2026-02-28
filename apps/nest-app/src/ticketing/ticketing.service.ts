import { AnomalySeverity, AnomalyStatus } from '@/log-analysis';
import { AnomalyContextQuery } from '@/queries';
import { AnomalyCreatedEvent, TicketCreatedEvent } from '@/shared/events';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 as EventEmitter, OnEvent } from '@nestjs/event-emitter';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { Ticket, TicketSeverity } from './ticketing.types';

@Injectable()
export class TicketingService {
  constructor(
    private readonly ticketingProviderFactory: TicketingProviderFactory,
    private readonly anomalyContextQuery: AnomalyContextQuery,
    private readonly eventEmitter: EventEmitter,
  ) {}

  @OnEvent(AnomalyCreatedEvent.name)
  async handleAnomalyCreatedEvent(event: AnomalyCreatedEvent) {
    const res = await this.anomalyContextQuery.execute(event.payload.anomalyId);

    if (res.isErr()) {
      // TODO: Handle error
      return;
    }

    const { anomaly, ticketingSystemConfig: providerConfig } = res.value;

    if (!providerConfig?.type) {
      // TODO: Handle error
      return;
    }

    const provider = this.ticketingProviderFactory.create(providerConfig);
    if (anomaly.status !== AnomalyStatus.OPEN) {
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
        anomalyId: anomaly.id,
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

  async updateTicket(
    ticketId: string,
    props: Pick<Ticket, 'title' | 'description' | 'status'>,
  ) {
    throw new Error('Not implemented');
  }
}
