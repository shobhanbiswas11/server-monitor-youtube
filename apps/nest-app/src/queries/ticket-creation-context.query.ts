import { Anomaly } from '@/log-analysis';
import { Ticket, TicketSeverity, TicketStatus } from '@/ticketing';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { err, fromPromise, ok } from 'neverthrow';
import { Repository } from 'typeorm';

interface SSHConfiguration {
  host: string;
  username: string;
  privateKey: string;
}
export interface TicketCreationContext {
  ticket: {
    id: string;
    title: string;
    description?: string;
    severity: TicketSeverity;
    status: TicketStatus;
  };
  server: {
    isConnectionConfigured: boolean;
    sshConfiguration: SSHConfiguration;
  };
}

@Injectable()
export class TicketCreationContextQuery {
  constructor(
    @InjectRepository(Anomaly)
    private readonly anomalyRepo: Repository<Anomaly>,
  ) {}

  async execute(anomalyId: string) {
    return fromPromise(
      this.anomalyRepo.findOne({
        where: { id: anomalyId },
        relations: {
          logAnalysisJob: {
            remoteServer: true,
          },
        },
      }),
      () => 'DATABASE_ERROR' as const,
    ).andThen((anomaly) => {
      if (!anomaly) {
        return err('ANOMALY_NOT_FOUND' as const);
      }

      if (!anomaly.ticketInfo) {
        return err('TICKETING_INFO_NOT_FOUND' as const);
      }

      const server = anomaly.logAnalysisJob.remoteServer;

      if (!server) {
        return err('SERVER_NOT_FOUND' as const);
      }

      const result: TicketCreationContext = {
        ticket: anomaly.ticketInfo as Ticket,
        server: {
          isConnectionConfigured: server.isConnectionConfigured,
          sshConfiguration: server.config as SSHConfiguration,
        },
      };

      return ok(result);
    });
  }
}
