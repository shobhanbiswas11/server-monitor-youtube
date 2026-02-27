import { config } from 'dotenv';
import { mock as mockFn } from 'vitest-mock-extended';

config({ path: '.env.test' });

global.mock = mockFn;
