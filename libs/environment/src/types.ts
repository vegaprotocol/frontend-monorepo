import type z from 'zod';

import type { configSchema } from './utils/validate-configuration';
import type { envSchema } from './utils/validate-environment';
import { Networks, ENV_KEYS } from './utils/validate-environment';

export { ENV_KEYS, Networks };

export type Environment = z.infer<typeof envSchema> & {
  // provide this manually, zod fails to compile the correct type fot VEGA_NETWORKS
  VEGA_NETWORKS: Partial<Record<Networks, string>>;
};

export type EnvKey = keyof Environment;

export type RawEnvironment = Record<EnvKey, string>;

export type Configuration = z.infer<typeof configSchema>;

export type ConfigStatus =
  | 'idle'
  | 'success'
  | 'loading-config'
  | 'loading-node'
  | 'error-loading-config'
  | 'error-validating-config'
  | 'error-loading-node';

type NodeCheck<T> = {
  isLoading: boolean;
  hasError: boolean;
  value?: T;
};

export type NodeData = {
  url: string;
  ssl: NodeCheck<boolean>;
  block: NodeCheck<number>;
  responseTime: NodeCheck<number>;
  chain: NodeCheck<string>;
};
