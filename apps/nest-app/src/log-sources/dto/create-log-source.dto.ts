import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { LogSourceType } from '../entities/log-source.entity';

export class CreateLogSourceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config: Record<string, any>;

  @IsEnum(LogSourceType)
  type: LogSourceType;
}
