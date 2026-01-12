import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisController } from './log-analysis.controller';

describe('LogAnalysisController', () => {
  let controller: LogAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogAnalysisController],
    }).compile();

    controller = module.get<LogAnalysisController>(LogAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
