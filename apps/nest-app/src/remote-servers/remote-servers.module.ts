import { LlmModule } from '@/llm/llm.module';
import { QueriesModule } from '@/queries';
import { TicketingModule } from '@/ticketing';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServer } from './entities/remote-server.entity';
import { MonitoringService } from './monitoring/monitoring.service';
import { RemoteServersController } from './remote-servers.controller';
import { RemoteServersService } from './remote-servers.service';
import { SshService } from './ssh/ssh.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteServer]),
    QueriesModule,
    LlmModule,
    TicketingModule,
  ],
  controllers: [RemoteServersController],
  providers: [RemoteServersService, MonitoringService, SshService],
  exports: [RemoteServersService],
})
export class RemoteServersModule {}
