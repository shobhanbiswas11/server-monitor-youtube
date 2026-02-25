import { Anomaly, LogAnalysisJob } from '@/log-analysis';
import { RemoteServer } from '@/remote-servers';
import { DataSource, DeepPartial } from 'typeorm';
import { createAnomaly } from './anomaly.factory';
import { createLogAnalysisJob } from './log-analysis-job.factory';
import { createRemoteServer } from './remote-server.factory';

interface JobSpec {
  job?: DeepPartial<LogAnalysisJob>;
  /** Number of anomalies to create, or an array of per-anomaly overrides */
  anomalies?: number | DeepPartial<Anomaly>[];
}

interface ServerGraphSpec {
  server?: DeepPartial<RemoteServer>;
  /** Number of jobs (with no anomalies), or a detailed per-job spec */
  jobs?: number | JobSpec[];
}

interface JobResult {
  job: LogAnalysisJob;
  anomalies: Anomaly[];
}

export interface ServerGraphResult {
  server: RemoteServer;
  jobs: JobResult[];
}

/**
 * Creates a server with an optional tree of jobs and anomalies.
 *
 * @example
 * // 1 server, 1 job, 5 anomalies
 * const { server, jobs } = await createServerGraph(datasource, {
 *   jobs: [{ anomalies: 5 }],
 * });
 *
 * @example
 * // 1 server, 2 jobs with different anomaly counts
 * const { jobs } = await createServerGraph(datasource, {
 *   jobs: [{ anomalies: 3 }, { anomalies: 1 }],
 * });
 *
 * @example
 * // Override specific fields anywhere in the graph
 * const { server } = await createServerGraph(datasource, {
 *   server: { name: 'prod-server', isConnectionConfigured: true },
 *   jobs: [{ anomalies: [{ severity: AnomalySeverity.CRITICAL }] }],
 * });
 */
export const createServerGraph = async (
  datasource: DataSource,
  spec: ServerGraphSpec = {},
): Promise<ServerGraphResult> => {
  const server = await createRemoteServer(datasource, spec.server);

  const jobSpecs = normalizeJobSpecs(spec.jobs);

  const jobs: JobResult[] = await Promise.all(
    jobSpecs.map(async (jobSpec) => {
      const job = await createLogAnalysisJob(datasource, {
        ...jobSpec.job,
        remoteServer: server,
      });

      const anomalyOverrides = normalizeAnomalyOverrides(jobSpec.anomalies);
      const anomalies = await Promise.all(
        anomalyOverrides.map((overrides) =>
          createAnomaly(datasource, { ...overrides, logAnalysisJob: job }),
        ),
      );

      return { job, anomalies };
    }),
  );

  return { server, jobs };
};

const normalizeJobSpecs = (jobs: ServerGraphSpec['jobs']): JobSpec[] => {
  if (!jobs) return [];
  if (typeof jobs === 'number') return Array.from({ length: jobs }, () => ({}));
  return jobs;
};

const normalizeAnomalyOverrides = (
  anomalies: JobSpec['anomalies'],
): DeepPartial<Anomaly>[] => {
  if (!anomalies) return [];
  if (typeof anomalies === 'number')
    return Array.from({ length: anomalies }, () => ({}));
  return anomalies;
};
