import type { ReactNode } from 'react';
import { useEffect, useState, createContext, useContext } from 'react';

import { NodeSwitcherDialog } from '../components/node-switcher-dialog';
import { useConfig } from './use-config';
import { useNodes } from './use-nodes';
import { compileEnvironment } from '../utils/compile-environment';
import { validateEnvironment } from '../utils/validate-environment';
import { getErrorType, getIsNodeLoading } from '../utils/validate-node';
import { ErrorType } from '../types';
import type { Environment, RawEnvironment, NodeData } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

export type EnvironmentState = Environment & {
  setNodeSwitcherOpen: () => void;
};

const EnvironmentContext = createContext({} as EnvironmentState);

const hasFinishedLoading = (node: NodeData) =>
  node.initialized && !getIsNodeLoading(node) && !node.verified;

export const EnvironmentProvider = ({
  definitions,
  children,
}: EnvironmentProviderProps) => {
  const [networkError, setNetworkError] = useState<undefined | ErrorType>();
  const [isNodeSwitcherOpen, setNodeSwitcherOpen] = useState(false);
  const [environment, updateEnvironment] = useState<Environment>(
    compileEnvironment(definitions)
  );
  const { config } = useConfig(environment, (errorType) => {
    setNetworkError(errorType);
    setNodeSwitcherOpen(true);
  });
  const { state: nodes, clients } = useNodes(environment.VEGA_ENV, config);
  const nodeKeys = Object.keys(nodes);

  useEffect(() => {
    if (!environment.VEGA_URL) {
      const successfulNodeUrl = nodeKeys.find((key) => nodes[key].verified);
      if (successfulNodeUrl) {
        Object.keys(clients).forEach((node) => clients[node]?.stop());
        updateEnvironment((prevEnvironment) => ({
          ...prevEnvironment,
          VEGA_URL: successfulNodeUrl,
        }));
      }
    }

    if (environment.VEGA_URL && nodes[environment.VEGA_URL]) {
      const errorType = getErrorType(
        environment.VEGA_ENV,
        nodes[environment.VEGA_URL]
      );
      if (errorType) {
        Object.keys(clients).forEach((node) => clients[node]?.stop());
        setNetworkError(errorType);
        setNodeSwitcherOpen(true);
      }
    }

    if (
      nodeKeys.filter((key) => hasFinishedLoading(nodes[key])).length ===
      nodeKeys.length
    ) {
      Object.keys(clients).forEach((node) => clients[node]?.stop());
      setNetworkError(ErrorType.CONNECTION_ERROR_ALL);
      setNodeSwitcherOpen(true);
    }
  }, [environment.VEGA_URL, nodes]);

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

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
