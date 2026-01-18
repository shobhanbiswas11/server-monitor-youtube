import { DatabaseTestModule } from '@/database/database-test.module';
import { DatabaseModule } from '@/database/database.module';
import { CreateLogAnalysisJobDto } from '@/log-analysis/log-analysis-jobs/dto/create-log-analysis-job.dto';
import { LogAnalysisJobType } from '@/log-analysis/log-analysis-jobs/entities/log-analysis-job.entity';
import { CreateRemoteServerDto } from '@/remote-servers/dto/create-remote-server.dto';
import { TicketingProviderFactory } from '@/ticketing/ticketing-providers/ticketing-provider.factory';
import type { ITicketingProvider } from '@/ticketing/ticketing-providers/ticketing-provider.interface';
import { TicketSeverity } from '@/ticketing/ticketing.types';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { resetDatabase } from './test-utils';

describe('Ticket Creation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let moduleFixture: TestingModule;
  const ticketProviderFactory = mock<TicketingProviderFactory>();
  const ticketProvider = mock<ITicketingProvider>();
  ticketProviderFactory.create.mockReturnValue(ticketProvider as any);

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(DatabaseTestModule)
      .overrideProvider(TicketingProviderFactory)
      .useValue(ticketProviderFactory)
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    await app.init();
  });

  afterEach(async () => {
    await resetDatabase(dataSource);
    await app.close();
  });

  describe('ticket creation', () => {
    it('should create a ticket', async () => {
      // Create a remote server
      const createRemoteServerDto: CreateRemoteServerDto = {
        name: 'test-remote-server',
        config: {
          url: 'https://test-remote-server.com',
        },
      };
      const remoteServerResponse = await request(app.getHttpServer())
        .post('/remote-servers')
        .send(createRemoteServerDto)
        .expect(201);

      // create a job
      const createLogAnalysisJobDto: CreateLogAnalysisJobDto = {
        name: 'test-log-analysis-job',
        type: LogAnalysisJobType.RECURRING,
        description: 'test-log-analysis-job-description',
        remoteServerId: remoteServerResponse.body.id,
        ticketingSystemConfig: {
          type: 'ServiceNowTicketingProvider',
        },
      };

      const logAnalysisJobResponse = await request(app.getHttpServer())
        .post('/log-analysis-jobs')
        .send(createLogAnalysisJobDto)
        .expect(201);

      // send error logs to the job

      const errorLogs = [
        {
          message: 'test-error-log',
          level: 'error',
        },
      ];

      await request(app.getHttpServer())
        .post(`/log-analysis/ingest/${logAnalysisJobResponse.body.id}`)
        .send(errorLogs)
        .expect(200);

      // verify the ticket was created
      expect(ticketProvider.createTicket).toHaveBeenCalledTimes(1);
      expect(ticketProvider.createTicket).toHaveBeenCalledWith({
        title: 'test-error-log',
        description: expect.any(String),
        severity: TicketSeverity.HIGH,
      });
    });
  });
});
