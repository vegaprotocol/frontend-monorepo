import { useState, useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import {
  RadioGroup,
  Button,
  Input,
  Link,
  Radio,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '../../hooks/use-environment';
import { useNodes } from '../../hooks/use-nodes';
import {
  getIsNodeLoading,
  getIsNodeDisabled,
  getIsFormDisabled,
  getErrorType,
  getErrorByType,
  getHasInvalidChain,
} from '../../utils/validate-node';
import { CUSTOM_NODE_KEY } from '../../types';
import type { Configuration, NodeData, ErrorType, Networks } from '../../types';
import { LayoutRow } from './layout-row';
import { NodeError } from './node-error';
import { NodeStats } from './node-stats';

type NodeSwitcherProps = {
  error?: string;
  config: Configuration;
  initialErrorType?: ErrorType;
  onConnect: (url: string) => void;
};

const getDefaultNode = (urls: string[], currentUrl?: string) => {
  return currentUrl && urls.includes(currentUrl) ? currentUrl : undefined;
};

const getHighestBlock = (env: Networks, state: Record<string, NodeData>) => {
  return Object.keys(state).reduce((acc, node) => {
    if (getHasInvalidChain(env, state[node].chain.value)) return acc;
    const value = Number(state[node].block.value);
    return value ? Math.max(acc, value) : acc;
  }, 0);
};

export const NodeSwitcher = ({
  config,
  initialErrorType,
  onConnect,
}: NodeSwitcherProps) => {
  const { VEGA_ENV, VEGA_URL } = useEnvironment();
  const [networkError, setNetworkError] = useState(
    getErrorByType(initialErrorType, VEGA_ENV, VEGA_URL)
  );
  const [customNodeText, setCustomNodeText] = useState('');
  const [nodeRadio, setNodeRadio] = useState(
    getDefaultNode(config.hosts, VEGA_URL)
  );
  const { state, clients, updateNodeUrl, updateNodeBlock } = useNodes(
    VEGA_ENV,
    config
  );
  const highestBlock = useMemo(
    () => getHighestBlock(VEGA_ENV, state),
    [VEGA_ENV, state]
  );
  const customUrl = state[CUSTOM_NODE_KEY]?.url;

  const onSubmit = (node: ReturnType<typeof getDefaultNode>) => {
    if (node && state[node]) {
      onConnect(state[node].url);
    }
  };

  const isSubmitDisabled = getIsFormDisabled(
    nodeRadio,
    VEGA_ENV,
    state
  );

  const customNodeData =
    nodeRadio &&
    state[CUSTOM_NODE_KEY] &&
    state[CUSTOM_NODE_KEY].url === customNodeText
      ? state[nodeRadio]
      : undefined;

  const customNodeError = getErrorByType(
    getErrorType(VEGA_ENV, customNodeData),
    VEGA_ENV,
    customUrl
  );

  return (
    <div className="text-black dark:text-white w-full lg:min-w-[800px]">
      <NodeError {...(customNodeError || networkError)} />
      <form onSubmit={() => onSubmit(nodeRadio)}>
        <p className="text-body-large font-bold mt-16 mb-32">
          {t('Select a GraphQL node to connect to:')}
        </p>
        <div>
          <div className="hidden lg:block">
            <LayoutRow>
              <div />
              <span className="px-8 text-right">{t('Response time')}</span>
              <span className="px-8 text-right">{t('Block')}</span>
              <span className="px-8 text-right">{t('SSL')}</span>
            </LayoutRow>
          </div>
          <RadioGroup
            className="block"
            value={nodeRadio}
            onChange={(value) => {
              setNodeRadio(value);
              setNetworkError(null);
            }}
          >
            <div className="w-full">
              {config.hosts.map((node, index) => (
                <NodeStats
                  key={index}
                  data={state[node]}
                  client={clients[node]}
                  highestBlock={highestBlock}
                  setBlock={(block) => updateNodeBlock(node, block)}
                >
                  <div className="mb-8 break-all">
                    <Radio
                      id={`node-url-${index}`}
                      labelClassName="whitespace-nowrap text-ellipsis overflow-hidden"
                      value={node}
                      label={node}
                      disabled={getIsNodeDisabled(VEGA_ENV, state[node])}
                    />
                  </div>
                </NodeStats>
              ))}
              <NodeStats
                data={state[CUSTOM_NODE_KEY]}
                client={customUrl ? clients[customUrl] : undefined}
                highestBlock={highestBlock}
                setBlock={(block) => updateNodeBlock(CUSTOM_NODE_KEY, block)}
              >
                <div className="flex w-full mb-8">
                  <Radio
                    id={`node-url-custom`}
                    value={CUSTOM_NODE_KEY}
                    label={
                      nodeRadio === CUSTOM_NODE_KEY || !!state[CUSTOM_NODE_KEY]
                        ? ''
                        : t('Other')
                    }
                  />
                  {(customNodeText || nodeRadio === CUSTOM_NODE_KEY) && (
                    <div
                      data-testid="custom-node"
                      className="flex w-full gap-8"
                    >
                      <Input
                        placeholder="https://"
                        value={customNodeText}
                        hasError={
                          !!customNodeText &&
                          !!(
                            customNodeError?.headline ||
                            customNodeError?.message
                          )
                        }
                        onChange={(e) => setCustomNodeText(e.target.value)}
                      />
                      <Link
                        aria-disabled={
                          !customNodeText ||
                          getIsNodeLoading(state[CUSTOM_NODE_KEY])
                        }
                        onClick={() => {
                          setNetworkError(null);
                          updateNodeUrl(CUSTOM_NODE_KEY, customNodeText);
                        }}
                      >
                        {state[CUSTOM_NODE_KEY] &&
                        getIsNodeLoading(state[CUSTOM_NODE_KEY])
                          ? t('Checking')
                          : t('Check')}
                      </Link>
                    </div>
                  )}
                </div>
              </NodeStats>
            </div>
          </RadioGroup>
        </div>
        <Button
          className="w-full mt-16"
          disabled={isSubmitDisabled}
          type="submit"
          data-testid="connect"
        >
          {t('Connect')}
        </Button>
      </form>
    </div>
  );
};
