import { LogSource } from '@/log-sources/entities/log-source.entity';
import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServer } from '@/remote-servers/entities/remote-server.entity';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import {
  Anomaly,
  AnomalySeverity,
  AnomalyStatus,
} from './entities/anomaly.entity';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from './entities/log-analysis-job.entity';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;
  let repo: Mocked<Repository<LogAnalysisJob>>;
  let logSourcesService: Mocked<LogSourcesService>;
  let remoteServersService: Mocked<RemoteServersService>;
  let anomalyRepo: Mocked<Repository<Anomaly>>;
  let eventEmitter: Mocked<EventEmitter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogAnalysisJobsService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(LogAnalysisJobsService);
    repo = module.get(getRepositoryToken(LogAnalysisJob));
    logSourcesService = module.get(LogSourcesService);
    remoteServersService = module.get(RemoteServersService);
    anomalyRepo = module.get(getRepositoryToken(Anomaly));
    eventEmitter = module.get(EventEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(logSourcesService).toBeDefined();
    expect(remoteServersService).toBeDefined();
  });

  describe('create', () => {
    const getCreateDto = (overrides: Partial<CreateLogAnalysisJobDto> = {}) => {
      return {
        name: 'test',
        type: LogAnalysisJobType.ONE_TIME,
        description: 'test description',
        ticketingSystemConfig: {
          apiKey: 'api-key',
        },
        logSourceId: 'log-source-1',
        remoteServerId: 'remote-server-1',
        ...overrides,
      } as CreateLogAnalysisJobDto;
    };

    const logSource = new LogSource();
    const remoteServer = new RemoteServer();

    beforeEach(() => {
      logSourcesService.findOne.mockResolvedValue(logSource);
      remoteServersService.findOne.mockResolvedValue(remoteServer);
    });

    it('should create a log analysis job', async () => {
      const createDto = getCreateDto();
      await service.create(createDto, 'owner-1');

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...createDto,
        ownerId: 'owner-1',
        status: LogAnalysisJobStatus.INITIALIZED,
        logSource: logSource,
        remoteServer: remoteServer,
      });
    });

    it('should not throw error if log source is not provided', async () => {
      const createDto = getCreateDto({ logSourceId: undefined });
      await service.create(createDto, 'owner-1');

      expect(logSourcesService.findOne).toHaveBeenCalledTimes(0);
    });
  });

  describe('addAnomaly', () => {
    const mockJob = {
      id: 'job-1',
    } as LogAnalysisJob;

    const anomalyData = {
      title: 'Test Anomaly',
      description: 'Test Description',
      severity: AnomalySeverity.HIGH,
    };

    it('should return without creating an anomaly if existing anomaly with status OPEN exists', async () => {
      // Arrange
      const existingAnomaly = {
        id: 'anomaly-1',
        status: AnomalyStatus.OPEN,
      } as Anomaly;
      anomalyRepo.findOne.mockResolvedValue(existingAnomaly);

      // Act
      await service.addAnomaly(mockJob, anomalyData);

      // Assert
      expect(anomalyRepo.findOne).toHaveBeenCalledTimes(1);
      expect(anomalyRepo.findOne).toHaveBeenCalledWith({
        where: {
          logAnalysisJob: { id: mockJob.id },
          status: expect.anything(), // In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS])
        },
      });
      expect(anomalyRepo.create).not.toHaveBeenCalled();
      expect(anomalyRepo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return without creating an anomaly if existing anomaly with status IN_PROGRESS exists', async () => {
      // Arrange
      const existingAnomaly = {
        id: 'anomaly-1',
        status: AnomalyStatus.IN_PROGRESS,
      } as Anomaly;
      anomalyRepo.findOne.mockResolvedValue(existingAnomaly);

      // Act
      await service.addAnomaly(mockJob, anomalyData);

      // Assert
      expect(anomalyRepo.findOne).toHaveBeenCalledTimes(1);
      expect(anomalyRepo.findOne).toHaveBeenCalledWith({
        where: {
          logAnalysisJob: { id: mockJob.id },
          status: expect.anything(), // In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS])
        },
      });
      expect(anomalyRepo.create).not.toHaveBeenCalled();
      expect(anomalyRepo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should create and save an anomaly with appropriate fields when no existing anomaly exists', async () => {
      // Arrange
      anomalyRepo.findOne.mockResolvedValue(null);
      const createdAnomaly = {
        id: 'anomaly-1',
        ...anomalyData,
        status: AnomalyStatus.OPEN,
        logAnalysisJob: mockJob,
      } as Anomaly;
      anomalyRepo.create.mockReturnValue(createdAnomaly);
      anomalyRepo.save.mockResolvedValue(createdAnomaly);

      // Act
      await service.addAnomaly(mockJob, anomalyData);

      // Assert
      expect(anomalyRepo.findOne).toHaveBeenCalledTimes(1);
      expect(anomalyRepo.findOne).toHaveBeenCalledWith({
        where: {
          logAnalysisJob: { id: mockJob.id },
          status: expect.anything(), // In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS])
        },
      });
      expect(anomalyRepo.create).toHaveBeenCalledTimes(1);
      expect(anomalyRepo.create).toHaveBeenCalledWith({
        logAnalysisJob: mockJob,
        status: AnomalyStatus.OPEN,
        title: anomalyData.title,
        description: anomalyData.description,
        severity: anomalyData.severity,
      });
      expect(anomalyRepo.save).toHaveBeenCalledTimes(1);
      expect(anomalyRepo.save).toHaveBeenCalledWith(createdAnomaly);
    });

    it('should emit AnomalyCreatedEvent when an anomaly is created', async () => {
      // Arrange
      const mockJobWithOwner = {
        id: 'job-1',
        ownerId: 'owner-1',
      } as LogAnalysisJob;
      anomalyRepo.findOne.mockResolvedValue(null);
      const createdAnomaly = {
        id: 'anomaly-1',
        ...anomalyData,
        status: AnomalyStatus.OPEN,
        logAnalysisJob: mockJobWithOwner,
      } as Anomaly;
      anomalyRepo.create.mockReturnValue(createdAnomaly);
      anomalyRepo.save.mockResolvedValue(createdAnomaly);

      // Act
      await service.addAnomaly(mockJobWithOwner, anomalyData);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AnomalyCreatedEvent.name,
        expect.any(AnomalyCreatedEvent),
      );
      const emittedEvent = eventEmitter.emit.mock
        .calls[0][1] as AnomalyCreatedEvent;
      expect(emittedEvent.payload.ownerId).toBe('owner-1');
      expect(emittedEvent.payload.jobId).toBe('job-1');
      expect(emittedEvent.payload.anomalyId).toBe('anomaly-1');
    });
  });
});
