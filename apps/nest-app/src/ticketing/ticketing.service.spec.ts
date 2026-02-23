import {
  Anomaly,
  AnomalySeverity,
  AnomalyStatus,
  LogAnalysisJobsService,
} from '@/log-analysis';
import { AnomalyCreatedEvent, TicketCreatedEvent } from '@/shared/events';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
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
  let eventEmitter: Mocked<EventEmitter>;

  beforeEach(async () => {
    mockProvider = mock<ITicketingProvider>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketingService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(TicketingService);
    logAnalysisJobsService = module.get(LogAnalysisJobsService);
    ticketingProviderFactory = module.get(TicketingProviderFactory);
    eventEmitter = module.get(EventEmitter);

    //

    logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({
      type: 'ServiceNowTicketingProvider',
    });
    ticketingProviderFactory.create.mockReturnValue(mockProvider as any);
    event = new AnomalyCreatedEvent({
      anomalyId: 'anomaly-1',
      jobId: 'job-1',
      ownerId: 'owner-1',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(ticketingProviderFactory).toBeDefined();
    expect(logAnalysisJobsService).toBeDefined();
    expect(eventEmitter).toBeDefined();
  });

  let event: AnomalyCreatedEvent;
  const getAnomaly = (overrides: Partial<Anomaly> = {}) =>
    ({
      id: 'anomaly-1',
      title: 'Test Anomaly',
      description: 'Test Description',
      severity: AnomalySeverity.HIGH,
      status: AnomalyStatus.OPEN,
      ...overrides,
    }) as Anomaly;

  it('should return early when providerConfig is missing', async () => {
    logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(
      undefined,
    );

    await service.handleAnomalyCreatedEvent(event);
    expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
  });

  it('should return early when provider type is missing', async () => {
    logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({});
    await service.handleAnomalyCreatedEvent(event);
    expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
  });

  it('should return early when anomaly does not exist', async () => {
    logAnalysisJobsService.getAnomaly.mockResolvedValue(null);
    await service.handleAnomalyCreatedEvent(event);
    expect(mockProvider.createTicket).not.toHaveBeenCalled();
  });

  it('should return early when anomaly status is not OPEN', async () => {
    const anomaly = getAnomaly({
      status: AnomalyStatus.CLOSED,
    });
    logAnalysisJobsService.getAnomaly.mockResolvedValue(anomaly);
    await service.handleAnomalyCreatedEvent(event);
    expect(mockProvider.createTicket).not.toHaveBeenCalled();
  });

  it('should create ticket when providerConfig is valid', async () => {
    const anomaly = getAnomaly({
      severity: AnomalySeverity.HIGH,
      status: AnomalyStatus.OPEN,
    });
    logAnalysisJobsService.getAnomaly.mockResolvedValue(anomaly);
    await service.handleAnomalyCreatedEvent(event);
    expect(mockProvider.createTicket).toHaveBeenCalledWith({
      title: anomaly.title,
      description: anomaly.description,
      severity: TicketSeverity.HIGH,
    });
  });

  it('should raise an ticket created event when ticket is created', async () => {
    const anomaly = getAnomaly({
      severity: AnomalySeverity.HIGH,
      status: AnomalyStatus.OPEN,
    });
    logAnalysisJobsService.getAnomaly.mockResolvedValue(anomaly);
    await service.handleAnomalyCreatedEvent(event);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      TicketCreatedEvent.name,
      new TicketCreatedEvent({
        anomalyId: anomaly.id,
      }),
    );
  });
});
