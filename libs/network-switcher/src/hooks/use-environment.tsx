import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useConfig } from './use-config';
import { compileEnvironment } from '../utils/compile-environment';
import { validateEnvironment } from '../utils/validate-environment';
import type { Environment, RawEnvironment, ConfigStatus } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

type EnvironmentState = Environment & {
  configStatus: ConfigStatus;
};

const EnvironmentContext = createContext({} as EnvironmentState);

export const EnvironmentProvider = ({
  definitions,
  children,
}: EnvironmentProviderProps) => {
  const [environment, updateEnvironment] = useState<Environment>(
    compileEnvironment(definitions)
  );
  const { data: config, status: configStatus } = useConfig(environment);

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  useEffect(() => {
    if (config?.url) {
      updateEnvironment((environment) => ({
        ...environment,
        VEGA_URL: config.url,
      }));
    }
  }, [config?.url]);

  return (
    <EnvironmentContext.Provider value={{ ...environment, configStatus }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      'Error running "useEnvironment". No context found, make sure your component is wrapped in an <EnvironmentProvider />.'
    );
  }
  return context;
};
