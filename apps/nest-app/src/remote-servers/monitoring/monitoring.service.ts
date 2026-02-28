import { LlmService } from '@/llm';
import { TicketCreationContextQuery } from '@/queries';
import { TicketCreatedEvent } from '@/shared/events';
import { TicketStatus, TicketingService } from '@/ticketing';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import z from 'zod';
import { SshService } from '../ssh/ssh.service';

const ResolutionPlanSchema = z.object({
  canResolveWithSsh: z.boolean(),
  sshCommand: z.string().optional(),
  resolutionNotes: z.string(),
});

type ResolutionPlan = z.infer<typeof ResolutionPlanSchema>;

@Injectable()
export class MonitoringService {
  constructor(
    private readonly ticketCreationContextQuery: TicketCreationContextQuery,
    private readonly llm: LlmService,
    private readonly sshService: SshService,
    private readonly ticketingService: TicketingService,
  ) {}

  @OnEvent(TicketCreatedEvent.name)
  async handleTicketCreation(event: TicketCreatedEvent) {
    const res = await this.ticketCreationContextQuery.execute(
      event.payload.anomalyId,
    );

    if (res.isErr()) {
      return;
    }

    const { ticket, server } = res.value;

    const plan = await this.llm.generateObject({
      schema: ResolutionPlanSchema,
      system:
        'You are an assistant that decides whether an infrastructure incident can be resolved with a single, safe SSH command.',
      prompt: JSON.stringify({
        ticket,
        server: {
          isConnectionConfigured: server.isConnectionConfigured,
        },
      }),
    });

    if (!server.isConnectionConfigured || !plan.canResolveWithSsh) {
      await this.ticketingService.updateTicket(
        ticket.id,
        this.buildTicketUpdatePayload(ticket, plan),
      );
      return;
    }

    if (!plan.sshCommand) {
      await this.ticketingService.updateTicket(
        ticket.id,
        this.buildTicketUpdatePayload(ticket, plan),
      );
      return;
    }

    try {
      await this.sshService.executeCommand(
        server.sshConfiguration,
        plan.sshCommand,
      );

      await this.ticketingService.updateTicket(ticket.id, {
        title: ticket.title,
        status: TicketStatus.CLOSED,
        description: this.buildDescription(
          ticket.description,
          plan.resolutionNotes,
          'Issue resolved automatically via SSH command.',
        ),
      });
    } catch {
      await this.ticketingService.updateTicket(
        ticket.id,
        this.buildTicketUpdatePayload(ticket, plan, {
          status: TicketStatus.IN_PROGRESS,
          extraNote:
            'Automatic SSH remediation failed. Manual follow-up required.',
        }),
      );
    }
  }

  private buildTicketUpdatePayload(
    ticket: {
      title: string;
      description?: string;
      status: TicketStatus;
    },
    plan: ResolutionPlan,
    overrides?: {
      status?: TicketStatus;
      extraNote?: string;
    },
  ) {
    return {
      title: ticket.title,
      status: overrides?.status ?? ticket.status,
      description: this.buildDescription(
        ticket.description,
        plan.resolutionNotes,
        overrides?.extraNote,
      ),
    };
  }

  private buildDescription(
    originalDescription: string | undefined,
    resolutionNotes: string,
    extraNote?: string,
  ): string {
    const parts = [
      originalDescription?.trim(),
      `Resolution assistant notes: ${resolutionNotes}`,
      extraNote,
    ].filter(Boolean) as string[];

    return parts.join('\n\n');
  }
}
