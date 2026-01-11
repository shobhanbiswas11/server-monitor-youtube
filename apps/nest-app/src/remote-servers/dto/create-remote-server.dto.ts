import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRemoteServerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config: Record<string, any>;
}
