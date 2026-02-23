import { Module } from '@nestjs/common';
import { TicketCreationContextQuery } from './ticket-creation-context.query';

@Module({
  providers: [TicketCreationContextQuery],
  exports: [TicketCreationContextQuery],
})
export class QueriesModule {}
