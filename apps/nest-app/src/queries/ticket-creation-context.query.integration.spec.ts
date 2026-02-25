import { DatabaseTestModule } from '@/database/database-test.module';
import { Anomaly } from '@/log-analysis';
import { createAnomaly, createServerGraph } from '@/testing/factories';
import { Ticket, TicketSeverity, TicketStatus } from '@/ticketing';
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TicketCreationContextQuery } from './ticket-creation-context.query';

describe('TicketCreationContextQuery Integration tests', () => {
  let query: TicketCreationContextQuery;
  let datasource: DataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseTestModule, TypeOrmModule.forFeature([Anomaly])],
      providers: [TicketCreationContextQuery],
    }).compile();

    query = module.get(TicketCreationContextQuery);
    datasource = module.get(DataSource);
  });

  afterEach(async () => {
    await datasource.destroy();
  });

  it('should be defined', () => {
    expect(query).toBeDefined();
    expect(datasource).toBeDefined();
  });

  it('should return anomaly not found when the anomaly does not exist', async () => {
    const result = await query.execute('anomaly-id-1');
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe('ANOMALY_NOT_FOUND');
  });

  it('should return ticket info not found when the anomaly has no ticket info', async () => {
    const anomaly = await createAnomaly(datasource, {
      ticketInfo: undefined,
    });
    const result = await query.execute(anomaly.id);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe('TICKETING_INFO_NOT_FOUND');
  });

  it('should return the ticket creation context', async () => {
    const ticket = {
      id: 'ticket-id-1',
      title: 'Ticket title',
      description: 'Ticket description',
      severity: TicketSeverity.LOW,
      status: TicketStatus.OPEN,
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    } satisfies Ticket;

    const sshConfiguration = {
      host: '127.0.0.1',
      username: 'test',
      privateKey: 'test',
    };

    const { jobs } = await createServerGraph(datasource, {
      server: {
        isConnectionConfigured: true,
        config: sshConfiguration,
      },
      jobs: [{ anomalies: [{ ticketInfo: ticket }] }],
    });
    const result = await query.execute(jobs[0].anomalies[0].id);
    expect(result.isOk()).toBe(true);

    const context = result._unsafeUnwrap();

    expect(context.ticket).toMatchObject({
      id: 'ticket-id-1',
      title: 'Ticket title',
      description: 'Ticket description',
      severity: TicketSeverity.LOW,
      status: TicketStatus.OPEN,
    });
    expect(context.server).toMatchObject({
      isConnectionConfigured: true,
      sshConfiguration,
    });
  });
});
