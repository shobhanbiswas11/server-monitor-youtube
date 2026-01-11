import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
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
  ) {}

  async create(props: CreateLogAnalysisJobDto, ownerId: string) {
    const logSource = await this.logSourcesService.getById(
      props.logSourceId,
      ownerId,
    );
    const remoteServer = await this.remoteServersService.getById(
      props.remoteServerId,
      ownerId,
    );

    const logAnalysisJob = this.repo.create({
      ...props,
      ownerId,
      status: LogAnalysisJobStatus.INITIALIZED,
      logSource,
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
}
