import type z from 'zod';
import type { tomlConfigSchema } from './utils/validate-configuration';
import type { envSchema } from './utils/validate-environment';

export enum Networks {
  VALIDATOR_TESTNET = 'VALIDATOR_TESTNET',
  MAINNET_MIRROR = 'MAINNET_MIRROR',
  CUSTOM = 'CUSTOM',
  TESTNET = 'TESTNET',
  STAGNET1 = 'STAGNET1',
  DEVNET = 'DEVNET',
  MAINNET = 'MAINNET',
}
export type Environment = z.infer<typeof envSchema>;
export type Configuration = z.infer<typeof tomlConfigSchema>;
export const CUSTOM_NODE_KEY = 'custom' as const;
