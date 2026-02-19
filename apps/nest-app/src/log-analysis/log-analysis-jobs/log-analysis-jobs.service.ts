import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { Anomaly, AnomalyStatus } from './entities/anomaly.entity';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
} from './entities/log-analysis-job.entity';

@Injectable()
export class LogAnalysisJobsService {
  constructor(
    @InjectRepository(LogAnalysisJob)
    private repo: Repository<LogAnalysisJob>,
    private logSourcesService: LogSourcesService,
    private remoteServersService: RemoteServersService,
    @InjectRepository(Anomaly)
    private anomalyRepo: Repository<Anomaly>,
    private eventEmitter: EventEmitter,
  ) {}

  async getAnomaly(anomalyId: string) {
    return this.anomalyRepo.findOne({
      where: {
        id: anomalyId,
      },
    });
  }

  async getTicketingSystemConfig(jobId: string) {
    const job = await this.repo.findOne({
      where: {
        id: jobId,
      },
      select: {
        ticketingSystemConfig: true,
      },
    });

    return job?.ticketingSystemConfig;
  }

  async create(
    props: CreateLogAnalysisJobDto,
    ownerId: string,
  ): Promise<LogAnalysisJob> {
    const remoteServer = await this.remoteServersService.findOne(
      props.remoteServerId,
      ownerId,
    );
    if (!remoteServer) {
      throw new BadRequestException('Remote server not found');
    }

    const logSource = props.logSourceId
      ? await this.logSourcesService.findOne(props.logSourceId, ownerId)
      : null;

    return this.repo.save({
      ...props,
      ownerId,
      status: LogAnalysisJobStatus.INITIALIZED,
      logSource: logSource ?? undefined,
      remoteServer,
    });
  }

  findAll(ownerId: string): Promise<LogAnalysisJob[]> {
    return this.repo.find({ where: { ownerId } });
  }

  findOne(id: string, ownerId: string): Promise<LogAnalysisJob> {
    return this.repo.findOneByOrFail({ id, ownerId });
  }

  async update(
    id: string,
    updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    ownerId: string,
  ) {
    return this.repo.update({ id, ownerId }, updateLogAnalysisJobDto);
  }

  async remove(id: string, ownerId: string) {
    return this.repo.delete({ id, ownerId });
  }

  async addAnomaly(
    job: LogAnalysisJob,
    {
      title,
      description,
      severity,
    }: Partial<Anomaly> & Pick<Anomaly, 'title' | 'severity' | 'description'>,
  ) {
    const existingAnomaly = await this.anomalyRepo.findOne({
      where: {
        logAnalysisJob: { id: job.id },
        status: In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS]),
      },
    });

    if (existingAnomaly) {
      return;
    }

    const anomaly = this.anomalyRepo.create({
      logAnalysisJob: job,
      status: AnomalyStatus.OPEN,
      title,
      description,
      severity,
    });
    await this.anomalyRepo.save(anomaly);

    this.eventEmitter.emit(
      AnomalyCreatedEvent.name,
      new AnomalyCreatedEvent({
        ownerId: job.ownerId,
        jobId: job.id,
        anomalyId: anomaly.id,
      }),
    );
  }
}
