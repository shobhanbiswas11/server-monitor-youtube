import { Module } from '@nestjs/common';
import { LogAnalysisJobsModule } from './log-analysis-jobs/log-analysis-jobs.module';

@Module({
  imports: [LogAnalysisJobsModule]
})
export class LogAnalysisModule {}
