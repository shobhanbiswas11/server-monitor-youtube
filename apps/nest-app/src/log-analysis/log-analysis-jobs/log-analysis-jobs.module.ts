import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogSourcesModule } from 'src/log-sources/log-sources.module';
import { RemoteServersModule } from 'src/remote-servers/remote-servers.module';
import { LogAnalysisJob } from './entities/log-analysis-job.entity';
import { LogAnalysisJobsController } from './log-analysis-jobs.controller';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogAnalysisJob]),
    LogSourcesModule,
    RemoteServersModule,
  ],
  controllers: [LogAnalysisJobsController],
  providers: [LogAnalysisJobsService],
})
export class LogAnalysisJobsModule {}
