import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from '@/log-analysis';
import { faker } from '@faker-js/faker';
import { DataSource, DeepPartial } from 'typeorm';
import { createRemoteServer } from './remote-server.factory';

export const createLogAnalysisJob = async (
  datasource: DataSource,
  overrides?: DeepPartial<LogAnalysisJob>,
): Promise<LogAnalysisJob> => {
  const repo = datasource.getRepository(LogAnalysisJob);

  const remoteServer =
    overrides?.remoteServer ?? (await createRemoteServer(datasource));

  return repo.save({
    name: faker.lorem.words(3),
    type: LogAnalysisJobType.RECURRING,
    status: LogAnalysisJobStatus.INITIALIZED,
    ownerId: faker.string.uuid(),
    remoteServer,
    ...overrides,
  });
};
