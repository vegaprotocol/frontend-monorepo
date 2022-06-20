import z from 'zod';
import type { Configuration } from '../types';
import { compileErrors } from './compile-errors';

export const configSchema = z.object({
  hosts: z.array(z.string()),
});

export const validateConfiguration = (
  config: Configuration
): string | undefined => {
  try {
    configSchema.parse(config);
    return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return compileErrors('Error processing the vega app configuration', err);
  }
};
