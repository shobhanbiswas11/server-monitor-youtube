import { IsOptional, IsString } from 'class-validator';

export class UpdateLogAnalysisJobDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
