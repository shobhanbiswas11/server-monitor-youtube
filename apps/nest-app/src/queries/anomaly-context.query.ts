import { Anomaly } from '@/log-analysis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { err, fromPromise, ok } from 'neverthrow';
import { Repository } from 'typeorm';

@Injectable()
export class AnomalyContextQuery {
  constructor(
    @InjectRepository(Anomaly)
    private readonly anomalyRepo: Repository<Anomaly>,
  ) {}

  async execute(anomalyId: string) {
    return fromPromise(
      this.anomalyRepo.findOne({
        where: { id: anomalyId },
        relations: {
          logAnalysisJob: true,
        },
      }),
      () => 'DATABASE_ERROR' as const,
    ).andThen((anomaly) => {
      if (!anomaly) {
        return err('ANOMALY_NOT_FOUND' as const);
      }

      return ok({
        anomaly,
        ticketingSystemConfig: anomaly.logAnalysisJob.ticketingSystemConfig,
      });
    });
  }
}
