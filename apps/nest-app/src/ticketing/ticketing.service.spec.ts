import { AnomalySeverity } from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { ITicketingProvider } from './ticketing-providers/ticketing-provider.interface';
import { TicketingService } from './ticketing.service';
import { TicketSeverity } from './ticketing.types';

describe('TicketingService', () => {
  let service: TicketingService;
  let ticketingProviderFactory: Mocked<TicketingProviderFactory>;
  let mockProvider: Mocked<ITicketingProvider>;

  beforeEach(async () => {
    mockProvider = mock<ITicketingProvider>();
    ticketingProviderFactory = mock<TicketingProviderFactory>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketingService,
        {
          provide: TicketingProviderFactory,
          useValue: ticketingProviderFactory,
        },
      ],
    }).compile();

    service = module.get<TicketingService>(TicketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleAnomalyCreatedEvent', () => {
    it('should return early when providerConfig is missing', () => {
      const event = new AnomalyCreatedEvent({
        anomaly: {
          id: 'anomaly-1',
          title: 'Test Anomaly',
          description: 'Test Description',
          severity: AnomalySeverity.HIGH,
          status: 'open' as any,
        } as any,
        job: {
          ticketingSystemConfig: null,
        } as any,
      });

      const result = service.handleAnomalyCreatedEvent(event);

      expect(result).toBeUndefined();
      expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
    });

    it('should return early when providerType is missing', () => {
      const event = new AnomalyCreatedEvent({
        anomaly: {
          id: 'anomaly-1',
          title: 'Test Anomaly',
          description: 'Test Description',
          severity: AnomalySeverity.HIGH,
          status: 'open' as any,
        } as any,
        job: {
          ticketingSystemConfig: {},
        } as any,
      });

      const result = service.handleAnomalyCreatedEvent(event);

      expect(result).toBeUndefined();
      expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
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

      const event = new AnomalyCreatedEvent({
        anomaly: {
          id: 'anomaly-1',
          title: 'Test Anomaly',
          description: 'Test Description',
          severity: AnomalySeverity.HIGH,
          status: 'open' as any,
        } as any,
        job: {
          ticketingSystemConfig: {
            providerType: 'ServiceNowTicketingProvider',
          },
        } as any,
      });

      const result = await service.handleAnomalyCreatedEvent(event);

      expect(ticketingProviderFactory.create).toHaveBeenCalledWith({
        providerType: 'ServiceNowTicketingProvider',
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

      const event = new AnomalyCreatedEvent({
        anomaly: {
          id: 'anomaly-1',
          title: 'Test Anomaly',
          description: 'Test Description',
          severity: AnomalySeverity.MEDIUM,
          status: 'open' as any,
        } as any,
        job: {
          ticketingSystemConfig: {
            providerType: 'ServiceNowTicketingProvider',
          },
        } as any,
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
