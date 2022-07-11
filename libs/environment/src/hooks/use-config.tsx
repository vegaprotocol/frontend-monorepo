import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { ErrorType } from '../types';
import type { Environment, Configuration, Networks } from '../types';
import { validateConfiguration } from '../utils/validate-configuration';
import { promiseRaceToSuccess } from '../utils/promise-race-success';
import { requestNode } from '../utils/request-node';
import { getHasInvalidChain } from '../utils/validate-node';

export const LOCAL_STORAGE_NETWORK_KEY = 'vegaNetworkConfig';

export type EnvironmentWithOptionalUrl = Partial<Environment> &
  Omit<Environment, 'VEGA_URL'>;

const requestToNode =
  (
    env: Networks,
    setSubscriptionStatus: (url: string, status: boolean) => void
  ) =>
  async (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      requestNode(url, {
        onStatsSuccess: (data) => {
          if (getHasInvalidChain(env, data.statistics.chainId)) {
            reject(ErrorType.INVALID_NETWORK);
            return;
          }
          resolve(url);
          return;
        },
        onStatsFailure: () => {
          console.log('REJECTED!')
          reject(ErrorType.CONNECTION_ERROR);
        },
        onSubscriptionSuccess: () => {
          setSubscriptionStatus(url, true);
        },
        onSubscriptionFailure: () => {
          setSubscriptionStatus(url, false);
        },
      });
    });

const compileHosts = (hosts: string[], envUrl?: string) => {
  if (envUrl && !hosts.includes(envUrl)) {
    return [...hosts, envUrl];
  }
  return hosts;
};

const getCachedConfig = (env: Networks) => {
  const value = LocalStorage.getItem(LOCAL_STORAGE_NETWORK_KEY);

  if (value) {
    try {
      const config = JSON.parse(value)[env] as Configuration;
      const hasError = validateConfiguration(config);

      if (hasError) {
        throw new Error('Invalid configuration found in the storage.');
      }

      return config;
    } catch (err) {
      LocalStorage.removeItem(LOCAL_STORAGE_NETWORK_KEY);
      console.warn(
        'Malformed data found for network configuration. Removed cached configuration, continuing...'
      );
    }
  }

  return undefined;
};

export const useConfig = (
  environment: EnvironmentWithOptionalUrl,
  updateEnvironment: Dispatch<SetStateAction<Environment>>,
  onError: (errorType: ErrorType) => void
) => {
  const [verified, setVerified] = useState(false);
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<
    Record<string, boolean>
  >({});
  const [config, setConfig] = useState<Configuration | undefined>(
    getCachedConfig(environment.VEGA_ENV)
  );

  useEffect(() => {
      (async () => {
        if (!config && environment.VEGA_CONFIG_URL) {
          try {
            const response = await fetch(environment.VEGA_CONFIG_URL);
            const configData: Configuration = await response.json();

            if (validateConfiguration(configData)) {
              onError(ErrorType.CONFIG_VALIDATION_ERROR);
              return;
            }

            const hosts = compileHosts(configData.hosts, environment.VEGA_URL);

            setConfig({ hosts });
            LocalStorage.setItem(
              LOCAL_STORAGE_NETWORK_KEY,
              JSON.stringify({
                [environment.VEGA_ENV]: {
                  hosts,
                },
              })
            );
          } catch (err) {
            onError(ErrorType.CONFIG_LOAD_ERROR);
          }
        }
      })();
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_CONFIG_URL, !!config, onError]);

  useEffect(() => {
    (async () => {
      if (environment.VEGA_URL && !verified) {
        try {
          await requestToNode(environment.VEGA_ENV, (index, status) => {
            setSubscriptionStatusMap((state) => ({
              ...state,
              [index]: status,
            }));
          })(environment.VEGA_URL);
          setVerified(true);
        } catch (err: any) {
          if (err in ErrorType) {
            onError(err);
            return;
          }
          onError(ErrorType.CONNECTION_ERROR);
        }
      }

      if (config && !environment.VEGA_URL) {
        try {
          console.log('HEYA1!')
          const requests = config.hosts.map(
            requestToNode(environment.VEGA_ENV, (url, status) => {
              setSubscriptionStatusMap((state) => ({
                ...state,
                [url]: status,
              }));
            })
          );

          const node = await promiseRaceToSuccess(requests);

          console.log('HEYA2!')

          setVerified(true);
          updateEnvironment((prevEnvironment) => ({
            ...prevEnvironment,
            VEGA_URL: node,
          }));
        } catch (err: any) {
          onError(ErrorType.CONNECTION_ERROR_ALL);
        }
      }
    })();
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_URL, verified, !!config, updateEnvironment]);

  useEffect(() => {
    if (subscriptionStatusMap[environment.VEGA_URL ?? ''] === false) {
      onError(ErrorType.SSL_ERROR);
    }
  }, [onError, subscriptionStatusMap[environment.VEGA_URL ?? '']]);

  return {
    config,
  };
};
