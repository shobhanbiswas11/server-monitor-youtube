import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { RemoteServersModule } from './remote-servers/remote-servers.module';
import { AuthModule } from './auth/auth.module';
import { LogSourcesModule } from './log-sources/log-sources.module';
import { LogAnalysisModule } from './log-analysis/log-analysis.module';

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
  ],
  controllers: [AppController],
})
export class AppModule {}
