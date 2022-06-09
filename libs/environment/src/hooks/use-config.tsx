import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import type { Environment, Configuration, ConfigStatus } from '../types';
import { validateConfiguration } from '../utils/validate-configuration';
import { promiseRaceToSuccess } from '../utils/promise-race-success';

const LOCAL_STORAGE_NETWORK_KEY = 'vegaNetworkConfig';

export type EnvironmentWithOptionalUrl = Partial<Environment> &
  Omit<Environment, 'VEGA_URL'>;

const requestToNode = async (url: string, index: number): Promise<number> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed connecting to node: ${url}.`);
  }
  return index;
};

const getCachedConfig = () => {
  const value = LocalStorage.getItem(LOCAL_STORAGE_NETWORK_KEY);

  if (value) {
    try {
      return JSON.parse(value) as Configuration;
    } catch (err) {
      LocalStorage.removeItem(LOCAL_STORAGE_NETWORK_KEY);
      console.warn(
        'Malformed data found for network configuration. Removed and continuing...'
      );
    }
  }

  return undefined;
};

export const useConfig = (
  environment: EnvironmentWithOptionalUrl,
  updateEnvironment: Dispatch<SetStateAction<Environment>>
) => {
  const [config, setConfig] = useState<Configuration | undefined>(
    getCachedConfig()
  );
  const [status, setStatus] = useState<ConfigStatus>(
    !environment.VEGA_URL ? 'idle' : 'success'
  );

  useEffect(() => {
    if (!config && status === 'idle') {
      (async () => {
        setStatus('loading-config');
        try {
          const response = await fetch(environment.VEGA_CONFIG_URL);
          const configData: Configuration = await response.json();

          if (!validateConfiguration(configData)) {
            setStatus('error-validating-config');
            return;
          }

          setConfig({ hosts: configData.hosts });
          LocalStorage.setItem(
            LOCAL_STORAGE_NETWORK_KEY,
            JSON.stringify({ hosts: configData.hosts })
          );
        } catch (err) {
          console.log(err);
          setStatus('error-loading-config');
        }
      })();
    }
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_CONFIG_URL, !!config, status, setStatus, setConfig]);

  useEffect(() => {
    if (
      config &&
      !['loading-node', 'success', 'error-loading-node'].includes(status)
    ) {
      (async () => {
        setStatus('loading-node');

        // if there's only one configured node to choose from, set is as the env url
        if (config.hosts.length === 1) {
          setStatus('success');
          updateEnvironment((prevEnvironment) => ({
            ...prevEnvironment,
            VEGA_URL: config.hosts[0],
          }));
          return;
        }

        // when there are multiple possible hosts, set the env url to the node which responds first
        try {
          const requests = config.hosts.map(requestToNode);
          const index = await promiseRaceToSuccess(requests);
          setStatus('success');
          updateEnvironment((prevEnvironment) => ({
            ...prevEnvironment,
            VEGA_URL: config.hosts[index],
          }));
        } catch (err) {
          setStatus('error-loading-node');
        }
      })();
    }
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, !!config, setStatus, updateEnvironment]);

  return {
    status,
  };
};
