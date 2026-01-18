import { CurrentUser } from '@/auth/current-user.decorator';
import type { ICurrentUser } from '@/auth/current-user.interface';
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { LogAnalysisService } from './log-analysis.service';

@Controller('log-analysis')
export class LogAnalysisController {
  constructor(private readonly logAnalysisService: LogAnalysisService) { }

  @ApiBody({ type: Array<Record<string, any>> })
  @HttpCode(200)
  @Post('ingest/:jobId')
  ingestLogs(
    @Param('jobId') jobId: string,
    @Body() body: Array<Record<string, any>>,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    // TODO: validate the body in future
    return this.logAnalysisService.ingestLogs(jobId, currentUser.id, body);
  }
}
