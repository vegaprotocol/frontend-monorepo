import type { ReactNode } from 'react';
import { useEffect, useState, createContext, useContext } from 'react';

import { NodeSwitcherDialog } from '../components/node-switcher-dialog';
import { useConfig } from './use-config';
import { useNodes } from './use-nodes';
import { compileEnvironment } from '../utils/compile-environment';
import { validateEnvironment } from '../utils/validate-environment';
import {
  getErrorType,
  getErrorByType,
  getIsNodeLoading,
} from '../utils/validate-node';
import { ErrorType } from '../types';
import type { Environment, RawEnvironment, NodeData } from '../types';

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

export type EnvironmentState = Environment & {
  networkError?: ErrorType;
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
    if (!environment.VEGA_URL) {
      setNetworkError(errorType);
      setNodeSwitcherOpen(true);
    } else {
      const error = getErrorByType(errorType, environment.VEGA_ENV);
      error && console.warn(error.headline);
    }
  });
  const { state: nodes, clients } = useNodes(environment.VEGA_ENV, config);
  const nodeKeys = Object.keys(nodes);

  useEffect(() => {
    if (!environment.VEGA_URL) {
      const successfulNodeKey = nodeKeys.find(
        (key) => nodes[key].verified
      ) as keyof typeof nodes;
      if (successfulNodeKey && nodes[successfulNodeKey]) {
        Object.keys(clients).forEach((node) => clients[node]?.stop());
        updateEnvironment((prevEnvironment) => ({
          ...prevEnvironment,
          VEGA_URL: nodes[successfulNodeKey].url,
        }));
      }
    }

    // if the selected node has errors
    if (environment.VEGA_URL && nodes[environment.VEGA_URL]) {
      const errorType = getErrorType(
        environment.VEGA_ENV,
        nodes[environment.VEGA_URL]
      );
      if (errorType !== null) {
        Object.keys(clients).forEach((node) => clients[node]?.stop());
        setNetworkError(errorType);
        setNodeSwitcherOpen(true);
        return;
      }
    }

    // if the config doesn't contain nodes the app can connect to
    if (
      nodeKeys.length > 0 &&
      nodeKeys.filter((key) => hasFinishedLoading(nodes[key])).length ===
        nodeKeys.length
    ) {
      Object.keys(clients).forEach((node) => clients[node]?.stop());
      setNetworkError(ErrorType.CONNECTION_ERROR_ALL);
      setNodeSwitcherOpen(true);
    }
    // prevent infinite render loop by skipping deps which will change as a result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment.VEGA_URL, nodes]);

  const errorMessage = validateEnvironment(environment);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return (
    <EnvironmentContext.Provider
      value={{
        ...environment,
        networkError,
        setNodeSwitcherOpen: () => setNodeSwitcherOpen(true),
      }}
    >
      {config && isNodeSwitcherOpen && (
        <NodeSwitcherDialog
          dialogOpen={true}
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
