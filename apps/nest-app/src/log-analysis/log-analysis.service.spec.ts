import { Test, TestingModule } from '@nestjs/testing';
import { AnomalySeverity } from './log-analysis-jobs/entities/anomaly.entity';
import { LogAnalysisJobsService } from './log-analysis-jobs/log-analysis-jobs.service';
import { LogAnalysisService } from './log-analysis.service';

describe('LogAnalysisService', () => {
  let service: LogAnalysisService;
  let logAnalysisJobsService: Mocked<LogAnalysisJobsService>;

  const mockJob = {
    id: 'job-1',
    ownerId: 'owner-1',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogAnalysisService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(LogAnalysisService);
    logAnalysisJobsService = module.get(LogAnalysisJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ingestLogs', () => {
    const jobId = 'job-1';
    const ownerId = 'owner-1';

    const logs = [
      { message: 'Error occurred', level: 'error' },
      { message: 'Critical failure', level: 'critical' },
      { message: 'Warning message', level: 'warning' },
    ];

    beforeEach(() => {
      logAnalysisJobsService.findOne.mockResolvedValue(mockJob);
    });

    it('should throw Exception when job is not found', async () => {
      logAnalysisJobsService.findOne.mockRejectedValue(
        new Error('Job not found'),
      );
      await expect(service.ingestLogs(jobId, ownerId, [])).rejects.toThrow();
    });

    it('should call addAnomaly for each log with proper attributes', async () => {
      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(
        jobId,
        ownerId,
      );
      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledTimes(3);
      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        1,
        mockJob,
        expect.objectContaining({
          title: 'Error occurred',
          severity: AnomalySeverity.HIGH,
        }),
      );
      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        2,
        mockJob,
        expect.objectContaining({
          title: 'Critical failure',
          severity: AnomalySeverity.CRITICAL,
        }),
      );
      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        3,
        mockJob,
        expect.objectContaining({
          title: 'Warning message',
          severity: AnomalySeverity.HIGH,
        }),
      );
    });

    it('should use default message when message is missing', async () => {
      const logs = [{ level: 'error' }];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(
        mockJob,
        expect.objectContaining({
          title: 'Untitled Log Message',
          severity: AnomalySeverity.HIGH,
        }),
      );
    });

    it('should use default level "error" when level is missing', async () => {
      const logs = [{ message: 'Some message' }];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(
        mockJob,
        expect.objectContaining({
          title: 'Some message',
          severity: AnomalySeverity.HIGH,
        }),
      );
    });

    it('should use CRITICAL severity for critical level', async () => {
      const logs = [{ message: 'Critical error', level: 'critical' }];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(
        mockJob,
        expect.objectContaining({
          title: 'Critical error',
          severity: AnomalySeverity.CRITICAL,
        }),
      );
    });

    it('should use HIGH severity for non-critical levels', async () => {
      const logs = [
        { message: 'Error log', level: 'error' },
        { message: 'Warning log', level: 'warning' },
        { message: 'Info log', level: 'info' },
        { message: 'Debug log', level: 'debug' },
      ];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledTimes(4);
      logs.forEach((log) => {
        expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(
          mockJob,
          expect.objectContaining({
            title: log.message,
            severity: AnomalySeverity.HIGH,
          }),
        );
      });
    });

    it('should handle empty logs array', async () => {
      await service.ingestLogs(jobId, ownerId, []);
      expect(logAnalysisJobsService.addAnomaly).not.toHaveBeenCalled();
    });

    it('should handle logs with empty message string', async () => {
      const logs = [{ message: '', level: 'error' }];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(
        mockJob,
        expect.objectContaining({
          title: 'Untitled Log Message',
          severity: AnomalySeverity.HIGH,
        }),
      );
    });
  });
});
