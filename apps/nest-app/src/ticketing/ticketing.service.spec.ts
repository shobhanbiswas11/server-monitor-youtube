import {
  AnomalySeverity,
  AnomalyStatus,
} from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';
import { LogAnalysisJobsService } from '@/log-analysis/log-analysis-jobs/log-analysis-jobs.service';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { ITicketingProvider } from './ticketing-providers/ticketing-provider.interface';
import { TicketingService } from './ticketing.service';
import { TicketSeverity } from './ticketing.types';

describe('TicketingService', () => {
  let service: TicketingService;
  let ticketingProviderFactory: Mocked<TicketingProviderFactory>;
  let logAnalysisJobsService: Mocked<LogAnalysisJobsService>;
  let mockProvider: Mocked<ITicketingProvider>;

  beforeEach(async () => {
    mockProvider = mock<ITicketingProvider>();
    ticketingProviderFactory = mock<TicketingProviderFactory>();
    logAnalysisJobsService = mock<LogAnalysisJobsService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketingService,
        {
          provide: TicketingProviderFactory,
          useValue: ticketingProviderFactory,
        },
        {
          provide: LogAnalysisJobsService,
          useValue: logAnalysisJobsService,
        },
      ],
    }).compile();

    service = module.get<TicketingService>(TicketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleAnomalyCreatedEvent', () => {
    it('should return early when providerConfig is missing', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(
        undefined,
      );

      const event = new AnomalyCreatedEvent({
        anomalyId: 'anomaly-1',
        jobId: 'job-1',
        ownerId: 'owner-1',
      });

      const result = await service.handleAnomalyCreatedEvent(event);

      expect(result).toBeUndefined();
      expect(
        logAnalysisJobsService.getTicketingSystemConfig,
      ).toHaveBeenCalledWith('job-1');
      expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
    });

    it('should return early when provider type is missing', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({});

      const event = new AnomalyCreatedEvent({
        anomalyId: 'anomaly-1',
        jobId: 'job-1',
        ownerId: 'owner-1',
      });

      const result = await service.handleAnomalyCreatedEvent(event);

      expect(result).toBeUndefined();
      expect(
        logAnalysisJobsService.getTicketingSystemConfig,
      ).toHaveBeenCalledWith('job-1');
      expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
    });

    it('should return early when anomaly does not exist', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({
        type: 'ServiceNowTicketingProvider',
      });
      logAnalysisJobsService.getAnomaly.mockResolvedValue(null);

      const event = new AnomalyCreatedEvent({
        anomalyId: 'anomaly-1',
        jobId: 'job-1',
        ownerId: 'owner-1',
      });

      const result = await service.handleAnomalyCreatedEvent(event);

      expect(result).toBeUndefined();
      expect(logAnalysisJobsService.getAnomaly).toHaveBeenCalledWith(
        'anomaly-1',
      );
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
    });

    it('should return early when anomaly status is not OPEN', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({
        type: 'ServiceNowTicketingProvider',
      });
      logAnalysisJobsService.getAnomaly.mockResolvedValue({
        id: 'anomaly-1',
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: AnomalySeverity.HIGH,
        status: AnomalyStatus.CLOSED,
      } as any);

      const event = new AnomalyCreatedEvent({
        anomalyId: 'anomaly-1',
        jobId: 'job-1',
        ownerId: 'owner-1',
      });

      const result = await service.handleAnomalyCreatedEvent(event);

      expect(result).toBeUndefined();
      expect(logAnalysisJobsService.getAnomaly).toHaveBeenCalledWith(
        'anomaly-1',
      );
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
    });

    it('should create ticket when providerConfig is valid', async () => {
      const mockTicket = {
        id: 'ticket-1',
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: TicketSeverity.HIGH,
        status: 'open' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProvider.createTicket.mockResolvedValue(mockTicket);
      ticketingProviderFactory.create.mockReturnValue(mockProvider as any);
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({
        type: 'ServiceNowTicketingProvider',
      });
      logAnalysisJobsService.getAnomaly.mockResolvedValue({
        id: 'anomaly-1',
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: AnomalySeverity.HIGH,
        status: AnomalyStatus.OPEN,
      } as any);

      const event = new AnomalyCreatedEvent({
        anomalyId: 'anomaly-1',
        jobId: 'job-1',
        ownerId: 'owner-1',
      });

      const result = await service.handleAnomalyCreatedEvent(event);

      expect(
        logAnalysisJobsService.getTicketingSystemConfig,
      ).toHaveBeenCalledWith('job-1');
      expect(logAnalysisJobsService.getAnomaly).toHaveBeenCalledWith(
        'anomaly-1',
      );
      expect(ticketingProviderFactory.create).toHaveBeenCalledWith({
        type: 'ServiceNowTicketingProvider',
      });
      expect(mockProvider.createTicket).toHaveBeenCalledWith({
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: TicketSeverity.HIGH,
      });
      expect(result).toEqual(mockTicket);
    });

    it('should map severity correctly when creating ticket', async () => {
      const mockTicket = {
        id: 'ticket-1',
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: TicketSeverity.MEDIUM,
        status: 'open' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProvider.createTicket.mockResolvedValue(mockTicket);
      ticketingProviderFactory.create.mockReturnValue(mockProvider as any);
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({
        type: 'ServiceNowTicketingProvider',
      });
      logAnalysisJobsService.getAnomaly.mockResolvedValue({
        id: 'anomaly-1',
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: AnomalySeverity.MEDIUM,
        status: AnomalyStatus.OPEN,
      } as any);

      const event = new AnomalyCreatedEvent({
        anomalyId: 'anomaly-1',
        jobId: 'job-1',
        ownerId: 'owner-1',
      });

      await service.handleAnomalyCreatedEvent(event);

      expect(mockProvider.createTicket).toHaveBeenCalledWith({
        title: 'Test Anomaly',
        description: 'Test Description',
        severity: TicketSeverity.MEDIUM,
      });
    });
  });
});
