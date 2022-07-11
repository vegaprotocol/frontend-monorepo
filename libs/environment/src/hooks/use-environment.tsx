import type { ReactNode } from 'react';
import { useEffect, useState, createContext, useContext } from 'react';

import { NodeSwitcherDialog } from '../components/node-switcher-dialog';
import { useConfig } from './use-config';
import { compileEnvironment } from '../utils/compile-environment';
import { validateEnvironment } from '../utils/validate-environment';
import type { Environment, RawEnvironment } from '../types';
import type { ErrorType } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

export type EnvironmentState = Environment & {
  setNodeSwitcherOpen: () => void;
};

const EnvironmentContext = createContext({} as EnvironmentState);

export const EnvironmentProvider = ({
  definitions,
  children,
}: EnvironmentProviderProps) => {
  const [networkError, setNetworkError] = useState<undefined | ErrorType>();
  const [isNodeSwitcherOpen, setNodeSwitcherOpen] = useState(false);
  const [environment, updateEnvironment] = useState<Environment>(
    compileEnvironment(definitions)
  );
  const { config } = useConfig(environment, updateEnvironment, (errorType) => {
    setNetworkError(errorType);
    setNodeSwitcherOpen(true);
  });

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  useEffect(() => {
    setNodeSwitcherOpen(true);
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        ...environment,
        setNodeSwitcherOpen: () => setNodeSwitcherOpen(true),
      }}
    >
      {config && (
        <NodeSwitcherDialog
          dialogOpen={isNodeSwitcherOpen}
          initialErrorType={networkError}
          setDialogOpen={setNodeSwitcherOpen}
          config={config}
          onConnect={(url) =>
            updateEnvironment((env) => ({ ...env, VEGA_URL: url }))
          }
        />
      )}
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
