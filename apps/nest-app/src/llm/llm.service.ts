import { Injectable } from '@nestjs/common';
import z from 'zod';

export interface GenerateTextParams {
  prompt: string;
  system?: string;
}

export interface GenerateObjectParams<
  T extends z.ZodType,
> extends GenerateTextParams {
  schema: T;
}

@Injectable()
export class LlmService {
  async generateText(params: GenerateTextParams): Promise<string> {
    throw new Error('Not implemented');
  }

  async generateObject<T extends z.ZodType>(
    params: GenerateObjectParams<T>,
  ): Promise<z.infer<T>> {
    throw new Error('Not implemented');
  }
}
