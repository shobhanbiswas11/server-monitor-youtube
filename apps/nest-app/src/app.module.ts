import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { LogAnalysisModule } from './log-analysis/log-analysis.module';
import { LogSourcesModule } from './log-sources/log-sources.module';
import { RemoteServersModule } from './remote-servers/remote-servers.module';
import { UsersModule } from './users/users.module';
import { TicketingModule } from './ticketing/ticketing.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    RemoteServersModule,
    AuthModule,
    LogSourcesModule,
    LogAnalysisModule,
    EventEmitterModule.forRoot(),
    TicketingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
