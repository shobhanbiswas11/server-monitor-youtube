import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { LogAnalysisJobType } from '../entities/log-analysis-job.entity';

export class CreateLogAnalysisJobDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LogAnalysisJobType)
  type: LogAnalysisJobType;

  @IsObject()
  @IsOptional()
  ticketingSystemConfig?: Record<string, any>;

  @IsString()
  @IsOptional()
  logSourceId?: string;

  @IsString()
  remoteServerId: string;
}
