import type { ReactNode } from 'react';
import { useState, createContext, useContext } from 'react';

import { NodeSwitcherDialog } from '../components/node-switcher-dialog';
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
  setNodeSwitcherOpen: () => void;
};

const EnvironmentContext = createContext({} as EnvironmentState);

export const EnvironmentProvider = ({
  definitions,
  children,
}: EnvironmentProviderProps) => {
  const [isNodeSwitcherOpen, setNodeSwitcherOpen] = useState(true);
  const [environment, updateEnvironment] = useState<Environment>(
    compileEnvironment(definitions)
  );
  const { status: configStatus, config } = useConfig(
    environment,
    updateEnvironment
  );

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return (
    <EnvironmentContext.Provider
      value={{
        ...environment,
        configStatus,
        setNodeSwitcherOpen: () => setNodeSwitcherOpen(true),
      }}
    >
      {config && (
        <div className="h-full dark:bg-black dark:text-white-60 bg-white relative z-0 text-black-60 grid grid-rows-[min-content,1fr]">
          <NodeSwitcherDialog
            dialogOpen={isNodeSwitcherOpen}
            setDialogOpen={setNodeSwitcherOpen}
            config={config}
            onConnect={(url) =>
              updateEnvironment((env) => ({ ...env, VEGA_URL: url }))
            }
          />
        </div>
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
