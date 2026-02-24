import { Anomaly } from '@/log-analysis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketCreationContextQuery } from './ticket-creation-context.query';

@Module({
  imports: [TypeOrmModule.forFeature([Anomaly])],
  providers: [TicketCreationContextQuery],
  exports: [TicketCreationContextQuery],
})
export class QueriesModule {}
