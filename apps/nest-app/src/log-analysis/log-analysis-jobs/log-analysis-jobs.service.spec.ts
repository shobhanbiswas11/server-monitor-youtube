import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
} from './entities/log-analysis-job.entity';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;
  let repo: Mocked<Repository<LogAnalysisJob>>;
  let logSourcesService: Mocked<LogSourcesService>;
  let remoteServersService: Mocked<RemoteServersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService,
        {
          provide: getRepositoryToken(LogAnalysisJob),
          useValue: mock<Repository<LogAnalysisJob>>(),
        },
        {
          provide: LogSourcesService,
          useValue: mock<LogSourcesService>(),
        },
        {
          provide: RemoteServersService,
          useValue: mock<RemoteServersService>(),
        },
      ],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
    repo = module.get<Mocked<Repository<LogAnalysisJob>>>(
      getRepositoryToken(LogAnalysisJob),
    );
    logSourcesService =
      module.get<Mocked<LogSourcesService>>(LogSourcesService);
    remoteServersService =
      module.get<Mocked<RemoteServersService>>(RemoteServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(logSourcesService).toBeDefined();
    expect(remoteServersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a log analysis job', async () => {
      // Arrange
      const props = {
        logSourceId: 'log-source-1',
        remoteServerId: 'remote-server-1',
      } as any;
      const logSource = {} as any;
      const remoteServer = {} as any;
      const createdJob = {} as any;
      const savedJob = {} as any;
      logSourcesService.getById.mockResolvedValue(logSource);
      remoteServersService.getById.mockResolvedValue(remoteServer);
      repo.create.mockReturnValue(createdJob);
      repo.save.mockResolvedValue(savedJob);

      // Act
      const result = await service.create(props, 'owner-1');

      // Assert
      expect(logSourcesService.getById).toHaveBeenCalledTimes(1);
      expect(logSourcesService.getById).toHaveBeenCalledWith(
        'log-source-1',
        'owner-1',
      );
      expect(remoteServersService.getById).toHaveBeenCalledTimes(1);
      expect(remoteServersService.getById).toHaveBeenCalledWith(
        'remote-server-1',
        'owner-1',
      );
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: 'owner-1',
        status: LogAnalysisJobStatus.INITIALIZED,
        logSource,
        remoteServer,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdJob);
      expect(result).toEqual(savedJob);
    });
  });

  describe('findAll', () => {
    it('should find all log analysis jobs', async () => {
      // Arrange
      const logAnalysisJobs = [] as any;
      repo.find.mockResolvedValue(logAnalysisJobs);

      // Act
      const result = await service.findAll('owner-1');

      // Assert
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: 'owner-1' } });
      expect(result).toEqual(logAnalysisJobs);
    });
  });

  describe('findOne', () => {
    it('should find a log analysis job', async () => {
      // Arrange
      const logAnalysisJob = {} as any;
      repo.findOneBy.mockResolvedValue(logAnalysisJob);

      // Act
      const result = await service.findOne('job-1', 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: 'job-1',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(logAnalysisJob);
    });
  });

  describe('getById', () => {
    it('should get a log analysis job by id', async () => {
      // Arrange
      const logAnalysisJob = {} as any;
      repo.findOneBy.mockResolvedValue(logAnalysisJob);

      // Act
      const result = await service.getById('job-1', 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: 'job-1',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(logAnalysisJob);
    });

    it('should throw an error if the log analysis job is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById('job-1', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getById('job-1', 'owner-1')).rejects.toThrow(
        'Log analysis job not found',
      );
    });
  });

  describe('update', () => {
    it('should update a log analysis job', async () => {
      // Arrange
      const logAnalysisJob = {} as any;
      const updatedJob = {} as any;
      repo.findOneBy.mockResolvedValue(logAnalysisJob);
      repo.save.mockResolvedValue(updatedJob);

      // Act
      const result = await service.update('job-1', { name: 'test' }, 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: 'job-1',
        ownerId: 'owner-1',
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...logAnalysisJob,
        name: 'test',
      });
      expect(result).toEqual(updatedJob);
    });

    it('should throw an error if the log analysis job is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('job-1', { name: 'test' }, 'owner-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a log analysis job', async () => {
      // Arrange
      const logAnalysisJob = {} as any;
      const deleteResponse = {} as any;
      repo.findOneBy.mockResolvedValue(logAnalysisJob);
      repo.delete.mockResolvedValue(deleteResponse);

      // Act
      const result = await service.remove('job-1', 'owner-1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: 'job-1',
        ownerId: 'owner-1',
      });
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({
        id: 'job-1',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(deleteResponse);
    });

    it('should throw an error if the log analysis job is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('job-1', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
