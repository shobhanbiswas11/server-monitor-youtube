import { Anomaly } from '@/log-analysis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnomalyContextQuery } from './anomaly-context.query';
import { TicketCreationContextQuery } from './ticket-creation-context.query';

@Module({
  imports: [TypeOrmModule.forFeature([Anomaly])],
  providers: [TicketCreationContextQuery, AnomalyContextQuery],
  exports: [TicketCreationContextQuery, AnomalyContextQuery],
})
export class QueriesModule {}
