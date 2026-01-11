import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { RemoteServersService } from './remote-servers.service';

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repo: Mocked<Repository<RemoteServer>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteServersService,
        {
          provide: getRepositoryToken(RemoteServer),
          useValue: mock<Repository<RemoteServer>>(),
        },
      ],
    }).compile();

    service = module.get<RemoteServersService>(RemoteServersService);
    repo = module.get<Mocked<Repository<RemoteServer>>>(
      getRepositoryToken(RemoteServer),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a remote server', async () => {
      // Arrange
      const props = {} as any;
      const createdProp = {} as any;
      const savedProps = {} as any;
      repo.save.mockResolvedValue(props);
      repo.create.mockReturnValue(createdProp);

      // Act
      const result = await service.create(props, '1');

      // Assert
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: '1',
        status: RemoteServerStatus.UNKNOWN,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdProp);
      expect(result).toEqual(savedProps);
    });
  });

  describe('findAll', () => {
    it('should find all remote servers', async () => {
      // Arrange
      const remoteServers = [] as any;
      repo.find.mockResolvedValue(remoteServers);

      // Act
      const result = await service.findAll('1');

      // Assert
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: '1' } });
      expect(result).toEqual(remoteServers);
    });
  });

  describe('findOne', () => {
    it('should find a remote server', async () => {
      // Arrange
      const remoteServer = {} as any;
      repo.findOneBy.mockResolvedValue(remoteServer);

      // Act
      const result = await service.findOne('1', 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: '1',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(remoteServer);
    });
  });

  describe('update', () => {
    it('should update a remote server', async () => {
      // Arrange
      const remoteServer = {} as any;
      repo.findOneBy.mockResolvedValue(remoteServer);
      repo.save.mockResolvedValue(remoteServer);

      // Act
      const result = await service.update('1', { name: 'test' }, 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: '1',
        ownerId: 'owner-1',
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...remoteServer,
        name: 'test',
      });
      expect(result).toEqual(remoteServer);
    });

    it('should throw an error if the remote server is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(
        service.update('1', { name: 'test' }, 'owner-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a remote server', async () => {
      // Arrange
      const remoteServer = {} as any;
      const deleteResponse = {} as any;
      repo.findOneBy.mockResolvedValue(remoteServer);
      repo.delete.mockResolvedValue(deleteResponse);

      // Act
      const result = await service.remove('1', 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: '1',
        ownerId: 'owner-1',
      });
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deleteResponse);
    });

    it('should throw an error if the remote server is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove('1', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
