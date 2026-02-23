import { TicketCreationContextQuery } from '@/queries';
import { TicketCreatedEvent } from '@/shared/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly ticketCreationContextQuery: TicketCreationContextQuery,
  ) {}

  @OnEvent(TicketCreatedEvent.name)
  async handleTicketCreation(event: TicketCreatedEvent) {
    const { anomalyId } = event.payload;
    const { server, ticket } =
      await this.ticketCreationContextQuery.execute(anomalyId);

    //
  }
}
