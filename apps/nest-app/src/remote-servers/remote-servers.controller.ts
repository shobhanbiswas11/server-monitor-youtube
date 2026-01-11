import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ICurrentUser } from 'src/auth/current-user.interface';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import { RemoteServersService } from './remote-servers.service';

@Controller('remote-servers')
export class RemoteServersController {
  constructor(private readonly remoteServersService: RemoteServersService) {}

  @Post()
  create(
    @Body() createRemoteServerDto: CreateRemoteServerDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    console.log(currentUser);
    return this.remoteServersService.create(
      createRemoteServerDto,
      currentUser.id,
    );
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRemoteServerDto: UpdateRemoteServerDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.remoteServersService.update(
      id,
      updateRemoteServerDto,
      currentUser.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.remove(id, currentUser.id);
  }
}
