import { QueriesModule } from '@/queries';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServer } from './entities/remote-server.entity';
import { MonitoringService } from './monitoring/monitoring.service';
import { RemoteServersController } from './remote-servers.controller';
import { RemoteServersService } from './remote-servers.service';

@Module({
  imports: [TypeOrmModule.forFeature([RemoteServer]), QueriesModule],
  controllers: [RemoteServersController],
  providers: [RemoteServersService, MonitoringService],
  exports: [RemoteServersService],
})
export class RemoteServersModule {}
