import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LogAnalysisModule } from './log-analysis/log-analysis.module';
import { LogSourcesModule } from './log-sources/log-sources.module';
import { QueriesModule } from './queries';
import { RemoteServersModule } from './remote-servers/remote-servers.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    RemoteServersModule,
    AuthModule,
    LogSourcesModule,
    LogAnalysisModule,
    EventEmitterModule.forRoot(),
    TicketingModule,
    DatabaseModule,
    QueriesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
