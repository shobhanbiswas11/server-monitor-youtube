import { QueriesModule } from '@/queries';
import { Module } from '@nestjs/common';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { TicketingService } from './ticketing.service';

@Module({
  providers: [TicketingService, TicketingProviderFactory],
  imports: [QueriesModule],
  exports: [TicketingService],
})
export class TicketingModule {}
