import { Anomaly, LogAnalysisJob } from '@/log-analysis';
import { LogSource } from '@/log-sources/entities/log-source.entity';
import { RemoteServer } from '@/remote-servers';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Anomaly, LogAnalysisJob, RemoteServer, LogSource],
      synchronize: true,
      dropSchema: true,
    }),
  ],
})
export class DatabaseTestModule {}
