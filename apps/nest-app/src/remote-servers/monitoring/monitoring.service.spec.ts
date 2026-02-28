import { LlmService } from '@/llm';
import { TicketCreationContextQuery } from '@/queries';
import { TicketCreatedEvent } from '@/shared/events';
import { TicketingService, TicketStatus } from '@/ticketing';
import { Test, TestingModule } from '@nestjs/testing';
import { SshService } from '../ssh/ssh.service';
import { MonitoringService } from './monitoring.service';

function createTicketCreationContext(overrides: Partial<any> = {}) {
  return {
    ticket: {
      id: 'ticket-1',
      title: 'CPU usage high',
      description: 'CPU usage crossed threshold',
      severity: 'high',
      status: TicketStatus.OPEN,
      ...overrides.ticket,
    },
    server: {
      isConnectionConfigured: true,
      sshConfiguration: {
        host: 'example.com',
        username: 'ubuntu',
        privateKey: 'PRIVATE_KEY',
        ...(overrides.server?.sshConfiguration ?? {}),
      },
      ...overrides.server,
    },
  };
}

function createTicketCreatedEvent(
  anomalyId: string = 'anomaly-1',
): TicketCreatedEvent {
  return new TicketCreatedEvent({ anomalyId });
}

describe('MonitoringService', () => {
  let service: MonitoringService;
  let ticketCreationContextQuery: Mocked<TicketCreationContextQuery>;
  let llm: Mocked<LlmService>;
  let sshService: Mocked<SshService>;
  let ticketingService: Mocked<TicketingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitoringService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(MonitoringService);
    ticketCreationContextQuery = module.get(TicketCreationContextQuery);
    llm = module.get(LlmService);
    sshService = module.get(SshService);
    ticketingService = module.get(TicketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleTicketCreation', () => {
    it('should return early when context query returns an error', async () => {
      ticketCreationContextQuery.execute.mockResolvedValue({
        isErr: () => true,
      } as any);

      await service.handleTicketCreation(createTicketCreatedEvent());

      expect(llm.generateObject).not.toHaveBeenCalled();
      expect(sshService.executeCommand).not.toHaveBeenCalled();
      expect(ticketingService.updateTicket).not.toHaveBeenCalled();
    });

    it('should only update ticket with helper notes when ssh resolution is not possible', async () => {
      const context = createTicketCreationContext({
        server: { isConnectionConfigured: false },
      });

      ticketCreationContextQuery.execute.mockResolvedValue({
        isErr: () => false,
        value: context,
      } as any);

      llm.generateObject.mockResolvedValue({
        canResolveWithSsh: false,
        resolutionNotes: 'Investigate application logs on server.',
      } as any);

      await service.handleTicketCreation(createTicketCreatedEvent());

      expect(sshService.executeCommand).not.toHaveBeenCalled();
      expect(ticketingService.updateTicket).toHaveBeenCalledWith(
        context.ticket.id,
        expect.objectContaining({
          title: context.ticket.title,
          status: context.ticket.status,
          description: expect.stringContaining(
            'Investigate application logs on server.',
          ),
        }),
      );
    });

    it('should execute ssh command and close ticket when resolution succeeds', async () => {
      const context = createTicketCreationContext();

      ticketCreationContextQuery.execute.mockResolvedValue({
        isErr: () => false,
        value: context,
      } as any);

      llm.generateObject.mockResolvedValue({
        canResolveWithSsh: true,
        sshCommand: 'sudo systemctl restart app',
        resolutionNotes: 'Restarting the app should resolve the issue.',
      } as any);

      sshService.executeCommand.mockResolvedValue(undefined as any);

      await service.handleTicketCreation(createTicketCreatedEvent());

      expect(sshService.executeCommand).toHaveBeenCalledWith(
        context.server.sshConfiguration,
        'sudo systemctl restart app',
      );

      expect(ticketingService.updateTicket).toHaveBeenCalledWith(
        context.ticket.id,
        expect.objectContaining({
          title: context.ticket.title,
          status: TicketStatus.CLOSED,
          description: expect.stringContaining(
            'Restarting the app should resolve the issue.',
          ),
        }),
      );
    });

    it('should update ticket with helper notes when ssh command fails', async () => {
      const context = createTicketCreationContext();

      ticketCreationContextQuery.execute.mockResolvedValue({
        isErr: () => false,
        value: context,
      } as any);

      llm.generateObject.mockResolvedValue({
        canResolveWithSsh: true,
        sshCommand: 'sudo systemctl restart app',
        resolutionNotes: 'Restarting the app should resolve the issue.',
      } as any);

      sshService.executeCommand.mockRejectedValue(
        new Error('SSH connection failed'),
      );

      await service.handleTicketCreation(createTicketCreatedEvent());

      expect(sshService.executeCommand).toHaveBeenCalledWith(
        context.server.sshConfiguration,
        'sudo systemctl restart app',
      );

      expect(ticketingService.updateTicket).toHaveBeenCalledWith(
        context.ticket.id,
        expect.objectContaining({
          title: context.ticket.title,
          status: TicketStatus.IN_PROGRESS,
          description: expect.stringContaining(
            'Restarting the app should resolve the issue.',
          ),
        }),
      );
    });
  });
});
