import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { ConfigStatus } from './use-config';
import { useConfig } from './use-config';
import { compileEnvironment } from '../utils/compile-environment';
import { validateEnvironment } from '../utils/validate-environment';
import type { Environment, RawEnvironment } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

type EnvironmentState = Environment & {
  status: ConfigStatus;
  setEnvironment: (env: Partial<Environment>) => void;
};

const EnvironmentContext = createContext({} as EnvironmentState);

export const EnvironmentProvider = ({
  definitions,
  children,
}: EnvironmentProviderProps) => {
  const [environment, updateEnvironment] = useState<Environment>(
    compileEnvironment(definitions)
  );
  const { data: config, status } = useConfig(environment);

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  useEffect(() => {
    if (config?.url) {
      updateEnvironment({ ...environment, VEGA_URL: config.url });
    }
  }, [config?.url]);

  const setEnvironment = (newEnvironmentProps: Partial<Environment>) =>
    updateEnvironment({
      ...environment,
      ...newEnvironmentProps,
    });

  return (
    <EnvironmentContext.Provider
      value={{ ...environment, status, setEnvironment }}
    >
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
