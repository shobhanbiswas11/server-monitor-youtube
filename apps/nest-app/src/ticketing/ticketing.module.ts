import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service';

@Module({
  providers: [TicketingService]
})
export class TicketingModule {}
