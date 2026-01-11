import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServer } from './entities/remote-server.entity';
import { RemoteServersController } from './remote-servers.controller';
import { RemoteServersService } from './remote-servers.service';

@Module({
  imports: [TypeOrmModule.forFeature([RemoteServer])],
  controllers: [RemoteServersController],
  providers: [RemoteServersService],
  exports: [RemoteServersService],
})
export class RemoteServersModule {}
