import { useState, useEffect } from 'react';
import { ErrorType } from '../types';
import type { Environment, Configuration } from '../types';
import { validateConfiguration } from '../utils/validate-configuration';

export type EnvironmentWithOptionalUrl = Partial<Environment> &
  Omit<Environment, 'VEGA_URL'>;

const compileHosts = (hosts: string[], envUrl?: string) => {
  if (envUrl && !hosts.includes(envUrl)) {
    return [...hosts, envUrl];
  }
  return hosts;
};

type UseConfigOptions = {
  environment: EnvironmentWithOptionalUrl;
  defaultConfig?: Configuration;
};

/**
 * Fetch list of hosts from the VEGA_CONFIG_URL
 */
export const useConfig = (
  { environment, defaultConfig }: UseConfigOptions,
  onError: (errorType: ErrorType) => void
) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Configuration | undefined>(
    defaultConfig
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
