import { useState } from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { compileEnvironment } from '../utils/compile-environment';
import { Environment, RawEnvironment, EnvKey } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

type EnvironmentState = Environment & {
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

  const missingKeys = Object.keys(environment)
    .filter((key) => typeof environment[key as EnvKey] === undefined)
    .map((key) => `"${key}"`)
    .join(', ');

  if (missingKeys.length) {
    throw new Error(
      `Error setting up the app environment. The following variables are missing from your environment: ${missingKeys}.`
    );
  }

  const setEnvironment = (newEnvironmentProps: Partial<Environment>) =>
    updateEnvironment({
      ...environment,
      ...newEnvironmentProps,
    });

  return (
    <EnvironmentContext.Provider value={{ ...environment, setEnvironment }}>
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
