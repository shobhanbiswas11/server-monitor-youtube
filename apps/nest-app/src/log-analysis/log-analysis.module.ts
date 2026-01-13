import { Module } from '@nestjs/common';
import { LogAnalysisJobsModule } from './log-analysis-jobs/log-analysis-jobs.module';
import { LogAnalysisController } from './log-analysis.controller';
import { LogAnalysisService } from './log-analysis.service';

@Module({
  imports: [LogAnalysisJobsModule],
  controllers: [LogAnalysisController],
  providers: [LogAnalysisService]
})
export class LogAnalysisModule {}
