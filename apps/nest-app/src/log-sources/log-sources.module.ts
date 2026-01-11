import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogSource } from './entities/log-source.entity';
import { LogSourcesController } from './log-sources.controller';
import { LogSourcesService } from './log-sources.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogSource])],
  controllers: [LogSourcesController],
  providers: [LogSourcesService],
})
export class LogSourcesModule {}
