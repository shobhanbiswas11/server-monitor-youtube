import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LogAnalysisJobType } from '../entities/log-analysis-job.entity';

export class CreateLogAnalysisJobDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LogAnalysisJobType)
  type: LogAnalysisJobType;

  @IsString()
  logSourceId: string;

  @IsString()
  remoteServerId: string;
}
