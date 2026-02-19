import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { RemoteServer } from './entities/remote-server.entity';
import { RemoteServersService } from './remote-servers.service';

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repo: Mocked<Repository<RemoteServer>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemoteServersService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(RemoteServersService);
    repo = module.get(getRepositoryToken(RemoteServer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a remote server', async () => {
      const createDto: CreateRemoteServerDto = {
        name: 'test',
        description: 'test description',
      };

      // Act
      const result = await service.create(createDto, '1');

      // Assert
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...createDto,
        ownerId: '1',
      });
    });
  });
});
