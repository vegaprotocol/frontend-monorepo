import { useState, useEffect } from 'react';
import type { Environment, ConfigStatus } from '../types';

type Configuration = {
  hosts: string[];
};

type Data = {
  url: string;
};

const requestToNode = async (url: string, index: number): Promise<number> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('');
  }
  return index;
};

export const useConfig = (environment: Environment) => {
  const [data, setData] = useState<Data | undefined>(undefined);
  const [config, setConfig] = useState<Configuration | undefined>(undefined);
  const [status, setStatus] = useState<ConfigStatus>(
    !environment.VEGA_URL ? 'loading-config' : 'success'
  );

  useEffect(() => {
    if (status !== 'success') {
      (async () => {
        setStatus('loading-config');
        try {
          const response = await fetch(environment.VEGA_CONFIG_URL);
          const config: Configuration = await response.json();
          setConfig({ hosts: config.hosts });
        } catch (err) {
          setStatus('error-loading-config');
        }
      })();
    }
  }, [environment.VEGA_CONFIG_URL, status, setStatus, setConfig]);

  useEffect(() => {
    if (status !== 'success' && config) {
      (async () => {
        setStatus('loading-node');
        try {
          const requests = config.hosts.map(requestToNode);
          const index = await Promise.race(requests);
          setStatus('success');
          setData({ url: config.hosts[index] });
        } catch (err) {
          setStatus('error-loading-node');
        }
      })();
    }
    // load config only once per runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_CONFIG_URL, status, !!config, setStatus, setData]);

  return {
    data,
    status,
  };
};
