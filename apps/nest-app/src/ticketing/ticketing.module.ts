import { LogAnalysisJobsModule } from '@/log-analysis/log-analysis-jobs/log-analysis-jobs.module';
import { Module } from '@nestjs/common';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { TicketingService } from './ticketing.service';

@Module({
  providers: [TicketingService, TicketingProviderFactory],
  imports: [LogAnalysisJobsModule],
})
export class TicketingModule {}
