import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import { RemoteServer } from './entities/remote-server.entity';

@Injectable()
export class RemoteServersService {
  constructor(
    @InjectRepository(RemoteServer)
    private repo: Repository<RemoteServer>,
  ) {}

  create(props: CreateRemoteServerDto, ownerId: string): Promise<RemoteServer> {
    return this.repo.save({
      ...props,
      ownerId,
    });
  }

  findAll(ownerId: string): Promise<RemoteServer[]> {
    return this.repo.find({ where: { ownerId } });
  }

  findOne(id: string, ownerId: string): Promise<RemoteServer> {
    return this.repo.findOneByOrFail({ id, ownerId });
  }

  async update(
    id: string,
    updateRemoteServerDto: UpdateRemoteServerDto,
    ownerId: string,
  ) {
    return this.repo.update({ id, ownerId }, updateRemoteServerDto);
  }

  async remove(id: string, ownerId: string) {
    return this.repo.delete({ id, ownerId });
  }
}
