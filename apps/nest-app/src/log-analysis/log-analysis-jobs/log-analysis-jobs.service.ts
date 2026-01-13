import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  async create(props: CreateLogAnalysisJobDto, ownerId: string) {
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

    const logAnalysisJob = this.repo.create({
      ...props,
      ownerId,
      status: LogAnalysisJobStatus.INITIALIZED,
      logSource: logSource ?? undefined,
      remoteServer,
    });
    return this.repo.save(logAnalysisJob);
  }

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  findOne(id: string, ownerId: string) {
    return this.repo.findOneBy({ id, ownerId });
  }

  async getById(id: string, ownerId: string) {
    const logAnalysisJob = await this.findOne(id, ownerId);
    if (!logAnalysisJob) {
      throw new NotFoundException('Log analysis job not found');
    }
    return logAnalysisJob;
  }

  async update(
    id: string,
    updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    ownerId: string,
  ) {
    const logAnalysisJob = await this.getById(id, ownerId);
    return this.repo.save({ ...logAnalysisJob, ...updateLogAnalysisJobDto });
  }

  async remove(id: string, ownerId: string) {
    await this.getById(id, ownerId);
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
  }
}
