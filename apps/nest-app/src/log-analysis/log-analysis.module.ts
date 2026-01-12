import { Module } from '@nestjs/common';
import { LogAnalysisJobsModule } from './log-analysis-jobs/log-analysis-jobs.module';
import { LogAnalysisController } from './log-analysis.controller';

@Module({
  imports: [LogAnalysisJobsModule],
  controllers: [LogAnalysisController]
})
export class LogAnalysisModule {}
