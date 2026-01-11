import { CurrentUser } from '@/auth/current-user.decorator';
import { ICurrentUser } from '@/auth/current-user.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

@Controller('log-analysis-jobs')
export class LogAnalysisJobsController {
  constructor(
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
  ) {}

  @Post()
  create(
    @Body() createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.create(
      createLogAnalysisJobDto,
      currentUser.id,
    );
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.update(
      id,
      updateLogAnalysisJobDto,
      currentUser.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.remove(id, currentUser.id);
  }
}
