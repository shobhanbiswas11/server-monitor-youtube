import { DatabaseTestModule } from '@/database/database-test.module';
import { DatabaseModule } from '@/database/database.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { resetDatabase } from './test-utils';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(DatabaseTestModule)
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    await app.init();
  });

  afterEach(async () => {
    await resetDatabase(dataSource);
    await app.close();
  });

  it('should return the current user', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(200).expect({
      id: 'default-user-1',
      name: 'Default User 1',
      email: 'default-user-1@example.com',
    });
  });
});
