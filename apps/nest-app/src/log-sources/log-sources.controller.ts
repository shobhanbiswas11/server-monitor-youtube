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
import type { ICurrentUser } from 'src/auth/current-user.interface';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import { LogSourcesService } from './log-sources.service';

@Controller('log-sources')
export class LogSourcesController {
  constructor(private readonly logSourcesService: LogSourcesService) {}

  @Post()
  create(
    @Body() createLogSourceDto: CreateLogSourceDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logSourcesService.create(createLogSourceDto, currentUser.id);
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogSourceDto: UpdateLogSourceDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logSourcesService.update(
      id,
      updateLogSourceDto,
      currentUser.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.remove(id, currentUser.id);
  }
}
