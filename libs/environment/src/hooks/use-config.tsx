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

const getCachedConfig = (env: Networks, envUrl?: string) => {
  const cacheKey = getCacheKey(env);
  const value = LocalStorage.getItem(cacheKey);

  if (value) {
    try {
      const config = JSON.parse(value) as Configuration;
      const hasError = validateConfiguration(config);

      if (hasError) {
        throw new Error('Invalid configuration found in the storage.');
      }

      return {
        ...config,
        hosts: compileHosts(config.hosts, envUrl),
      };
    } catch (err) {
      LocalStorage.removeItem(cacheKey);
      console.warn(
        'Malformed data found for network configuration. Removed cached configuration, continuing...'
      );
    }
  }

  return undefined;
};

type UseConfigOptions = {
  environment: EnvironmentWithOptionalUrl;
  defaultConfig?: Configuration;
};

export const useConfig = (
  { environment, defaultConfig }: UseConfigOptions,
  onError: (errorType: ErrorType) => void
) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Configuration | undefined>(
    defaultConfig ?? getCachedConfig(environment.VEGA_ENV, environment.VEGA_URL)
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!config && environment.VEGA_CONFIG_URL) {
        isMounted && setLoading(true);
        try {
          const response = await fetch(environment.VEGA_CONFIG_URL);
          const configData: Configuration = await response.json();

          if (validateConfiguration(configData)) {
            onError(ErrorType.CONFIG_VALIDATION_ERROR);
            isMounted && setLoading(false);
            return;
          }

          const hosts = compileHosts(configData.hosts, environment.VEGA_URL);

          isMounted && setConfig({ hosts });
          LocalStorage.setItem(
            getCacheKey(environment.VEGA_ENV),
            JSON.stringify({ hosts })
          );
          isMounted && setLoading(false);
        } catch (err) {
          if (isMounted) {
            setLoading(false);
            setConfig({ hosts: [] });
          }
          onError(ErrorType.CONFIG_LOAD_ERROR);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_CONFIG_URL, !!config, onError, setLoading]);

  return {
    loading,
    config,
  };
};
