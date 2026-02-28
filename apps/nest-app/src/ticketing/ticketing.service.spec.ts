import { Anomaly, AnomalySeverity, AnomalyStatus } from '@/log-analysis';
import { AnomalyContextQuery } from '@/queries';
import { AnomalyCreatedEvent, TicketCreatedEvent } from '@/shared/events';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { ok } from 'neverthrow';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { ITicketingProvider } from './ticketing-providers/ticketing-provider.interface';
import { TicketingService } from './ticketing.service';
import { TicketSeverity } from './ticketing.types';

describe('TicketingService', () => {
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

  let service: TicketingService;
  let ticketingProviderFactory: Mocked<TicketingProviderFactory>;
  let anomalyContextQuery: Mocked<AnomalyContextQuery>;
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
    anomalyContextQuery = module.get(AnomalyContextQuery);
    ticketingProviderFactory = module.get(TicketingProviderFactory);
    eventEmitter = module.get(EventEmitter);

    //
    ticketingProviderFactory.create.mockReturnValue(mockProvider as any);
    event = new AnomalyCreatedEvent({
      anomalyId: 'anomaly-1',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(ticketingProviderFactory).toBeDefined();
    expect(anomalyContextQuery).toBeDefined();
    expect(eventEmitter).toBeDefined();
  });

  const prepareContext = ({
    anomalyOverride,
    ticketingSystemConfig = {
      type: 'ServiceNowTicketingProvider',
    },
  }: {
    anomalyOverride?: Partial<Anomaly>;
    ticketingSystemConfig?: {
      type?: string;
    };
  }) => {
    const anomaly = getAnomaly(anomalyOverride);

    anomalyContextQuery.execute.mockResolvedValue(
      ok({
        anomaly,
        ticketingSystemConfig,
      }),
    );

    return {
      anomaly,
      ticketingSystemConfig,
    };
  };

  it('should return early when providerConfig is missing', async () => {
    anomalyContextQuery.execute.mockResolvedValue(
      ok({
        anomaly: getAnomaly(),
        ticketingSystemConfig: undefined,
      }),
    );

    await service.handleAnomalyCreatedEvent(event);
    expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
  });

  it('should return early when provider type is missing', async () => {
    prepareContext({
      ticketingSystemConfig: {
        type: undefined,
      },
    });

    await service.handleAnomalyCreatedEvent(event);
    expect(ticketingProviderFactory.create).not.toHaveBeenCalled();
  });

  it('should return early when anomaly status is not OPEN', async () => {
    const { anomaly } = prepareContext({
      anomalyOverride: {
        status: AnomalyStatus.CLOSED,
      },
    });

    await service.handleAnomalyCreatedEvent(event);
    expect(mockProvider.createTicket).not.toHaveBeenCalled();
  });

  it('should create ticket when providerConfig is valid', async () => {
    const { anomaly } = prepareContext({
      anomalyOverride: {
        severity: AnomalySeverity.HIGH,
        status: AnomalyStatus.OPEN,
      },
    });
    await service.handleAnomalyCreatedEvent(event);
    expect(mockProvider.createTicket).toHaveBeenCalledWith({
      title: anomaly.title,
      description: anomaly.description,
      severity: TicketSeverity.HIGH,
    });
  });

  it('should raise an ticket created event when ticket is created', async () => {
    const { anomaly } = prepareContext({
      anomalyOverride: {
        severity: AnomalySeverity.HIGH,
        status: AnomalyStatus.OPEN,
      },
    });
    await service.handleAnomalyCreatedEvent(event);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      TicketCreatedEvent.name,
      new TicketCreatedEvent({
        anomalyId: anomaly.id,
      }),
    );
  });
});
