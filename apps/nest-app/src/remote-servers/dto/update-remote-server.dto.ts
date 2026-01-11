import { PartialType } from '@nestjs/swagger';
import { CreateRemoteServerDto } from './create-remote-server.dto';

export class UpdateRemoteServerDto extends PartialType(CreateRemoteServerDto) {}
