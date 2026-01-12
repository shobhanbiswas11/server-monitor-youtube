import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

@Controller('log-analysis')
export class LogAnalysisController {
  @ApiBody({ type: Array<Record<string, any>> })
  @Post('ingest/:jobId')
  ingestLogs(
    @Param('jobId') jobId: string,
    @Body() body: Array<Record<string, any>>,
  ) {
    console.log(body);
  }
}
