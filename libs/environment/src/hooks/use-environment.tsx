import type { ReactNode } from 'react';
import { useState, createContext, useContext } from 'react';

import { useConfig } from './use-config';
import { compileEnvironment } from '../utils/compile-environment';
import { validateEnvironment } from '../utils/validate-environment';
import type { Environment, RawEnvironment, ConfigStatus } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

export type EnvironmentState = Environment & {
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
  const { status: configStatus } = useConfig(environment, updateEnvironment);

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

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
