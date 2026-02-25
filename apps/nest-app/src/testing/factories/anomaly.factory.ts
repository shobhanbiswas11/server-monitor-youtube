import { Anomaly, AnomalySeverity, AnomalyStatus } from '@/log-analysis';
import { faker } from '@faker-js/faker';
import { DataSource, DeepPartial } from 'typeorm';
import { createLogAnalysisJob } from './log-analysis-job.factory';

export const createAnomaly = async (
  datasource: DataSource,
  overrides?: DeepPartial<Anomaly>,
): Promise<Anomaly> => {
  const repo = datasource.getRepository(Anomaly);

  const logAnalysisJob =
    overrides?.logAnalysisJob ?? (await createLogAnalysisJob(datasource));

  return repo.save({
    title: faker.lorem.words(5),
    status: AnomalyStatus.OPEN,
    severity: AnomalySeverity.MEDIUM,
    logAnalysisJob,
    ...overrides,
  });
};
