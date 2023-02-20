import type z from 'zod';
import type { configSchema } from './utils/validate-configuration';
import type { envSchema } from './utils/validate-environment';

export enum Networks {
  CUSTOM = 'CUSTOM',
  SANDBOX = 'SANDBOX',
  TESTNET = 'TESTNET',
  STAGNET1 = 'STAGNET1',
  STAGNET3 = 'STAGNET3',
  DEVNET = 'DEVNET',
  MAINNET = 'MAINNET',
  MIRROR = 'MIRROR',
}
export type Environment = z.infer<typeof envSchema>;
export type Configuration = z.infer<typeof configSchema>;
export const CUSTOM_NODE_KEY = 'custom' as const;
