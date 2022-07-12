import { useState, useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { ErrorType } from '../types';
import type { Environment, Configuration, Networks } from '../types';
import { validateConfiguration } from '../utils/validate-configuration';

export const LOCAL_STORAGE_NETWORK_KEY = 'vegaNetworkConfig';

export type EnvironmentWithOptionalUrl = Partial<Environment> &
  Omit<Environment, 'VEGA_URL'>;

const compileHosts = (hosts: string[], envUrl?: string) => {
  if (envUrl && !hosts.includes(envUrl)) {
    return [...hosts, envUrl];
  }
  return hosts;
};

const getCacheKey = (env: Networks) => `${LOCAL_STORAGE_NETWORK_KEY}-${env}`;

const getCachedConfig = (env: Networks) => {
  const cacheKey = getCacheKey(env);
  const value = LocalStorage.getItem(cacheKey);

  if (value) {
    try {
      const config = JSON.parse(value) as Configuration;
      const hasError = validateConfiguration(config);

      if (hasError) {
        throw new Error('Invalid configuration found in the storage.');
      }

      return config;
    } catch (err) {
      LocalStorage.removeItem(cacheKey);
      console.warn(
        'Malformed data found for network configuration. Removed cached configuration, continuing...'
      );
    }
  }

  return undefined;
};

export const useConfig = (
  environment: EnvironmentWithOptionalUrl,
  onError: (errorType: ErrorType) => void
) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Configuration | undefined>(
    getCachedConfig(environment.VEGA_ENV)
  );

  useEffect(() => {
    (async () => {
      if (!config && environment.VEGA_CONFIG_URL) {
        setLoading(true);
        try {
          const response = await fetch(environment.VEGA_CONFIG_URL);
          const configData: Configuration = await response.json();
          setLoading(false);

          if (validateConfiguration(configData)) {
            onError(ErrorType.CONFIG_VALIDATION_ERROR);
            return;
          }

          const hosts = compileHosts(configData.hosts, environment.VEGA_URL);

          setConfig({ hosts });
          LocalStorage.setItem(
            getCacheKey(environment.VEGA_ENV),
            JSON.stringify({ hosts }),
          );
        } catch (err) {
          setLoading(false);
          onError(ErrorType.CONFIG_LOAD_ERROR);
        }
      }
    })();
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_CONFIG_URL, !!config, onError]);

  return {
    loading,
    config,
  };
};
