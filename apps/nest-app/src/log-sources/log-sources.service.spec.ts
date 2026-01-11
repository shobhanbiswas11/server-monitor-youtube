import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogSource, LogSourceStatus } from './entities/log-source.entity';
import { LogSourcesService } from './log-sources.service';

describe('LogSourcesService', () => {
  let service: LogSourcesService;
  let repo: Mocked<Repository<LogSource>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogSourcesService,
        {
          provide: getRepositoryToken(LogSource),
          useValue: mock<Repository<LogSource>>(),
        },
      ],
    }).compile();

    service = module.get<LogSourcesService>(LogSourcesService);
    repo = module.get<Mocked<Repository<LogSource>>>(
      getRepositoryToken(LogSource),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a log source', async () => {
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
        status: LogSourceStatus.UNKNOWN,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdProp);
      expect(result).toEqual(savedProps);
    });
  });

  describe('findAll', () => {
    it('should find all log sources', async () => {
      // Arrange
      const logSources = [] as any;
      repo.find.mockResolvedValue(logSources);

      // Act
      const result = await service.findAll('1');

      // Assert
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: '1' } });
      expect(result).toEqual(logSources);
    });
  });

  describe('findOne', () => {
    it('should find a log source', async () => {
      // Arrange
      const logSource = {} as any;
      repo.findOneBy.mockResolvedValue(logSource);

      // Act
      const result = await service.findOne('1', 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: '1',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(logSource);
    });
  });

  describe('update', () => {
    it('should update a log source', async () => {
      // Arrange
      const logSource = {} as any;
      repo.findOneBy.mockResolvedValue(logSource);
      repo.save.mockResolvedValue(logSource);

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
        ...logSource,
        name: 'test',
      });
      expect(result).toEqual(logSource);
    });

    it('should throw an error if the log source is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(
        service.update('1', { name: 'test' }, 'owner-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a log source', async () => {
      // Arrange
      const logSource = {} as any;
      const deleteResponse = {} as any;
      repo.findOneBy.mockResolvedValue(logSource);
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

    it('should throw an error if the log source is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove('1', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
