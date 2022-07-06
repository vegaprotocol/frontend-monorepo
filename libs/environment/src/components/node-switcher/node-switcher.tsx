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
  getErrorByData,
  getErrorByType,
} from '../../utils/validate-node';
import { CUSTOM_NODE_KEY } from '../../types';
import type { Configuration, NodeData, ErrorType } from '../../types';
import { LayoutRow } from './layout-row';
import { LayoutCell } from './layout-cell';
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

const getHighestBlock = (state: Record<string, NodeData>) => {
  return Object.keys(state).reduce((acc, node) => {
    const value = Number(state[node].block.value);
    return value ? Math.max(acc, value) : acc;
  }, 0);
};

export const NodeSwitcher = ({ config, initialErrorType, onConnect }: NodeSwitcherProps) => {
  const { VEGA_ENV, VEGA_URL } = useEnvironment();
  const [networkError, setNetworkError] = useState(getErrorByType(initialErrorType, VEGA_ENV, VEGA_URL));
  const [customNodeText, setCustomNodeText] = useState('');
  const [nodeRadio, setNodeRadio] = useState(
    getDefaultNode(config.hosts, VEGA_URL)
  );
  const { state, clients, customNode, setCustomNode, updateNodeBlock } =
    useNodes(config);
  const highestBlock = useMemo(() => getHighestBlock(state), [state]);

  const onSubmit = (node: ReturnType<typeof getDefaultNode>) => {
    if (node) {
      onConnect(node);
    }
  };

  const isSubmitDisabled = getIsFormDisabled(
    nodeRadio,
    customNodeText,
    VEGA_ENV,
    state
  );
  const currentNodeError = getErrorByData(
    VEGA_ENV,
    nodeRadio && customNode && customNode === customNodeText
      ? state[nodeRadio]
      : undefined
  );

  return (
    <div className="text-black dark:text-white min-w-[800px]">
      <NodeError {...(currentNodeError || networkError)} />
      <form onSubmit={() => onSubmit(nodeRadio)}>
        <p className="text-body-large font-bold mt-16 mb-32">
          {t('Select a GraphQL node to connect to:')}
        </p>
        <div>
          <LayoutRow>
            <div />
            <LayoutCell>{t('Response time')}</LayoutCell>
            <LayoutCell>{t('Block')}</LayoutCell>
            <LayoutCell>{t('SSL')}</LayoutCell>
          </LayoutRow>
          <RadioGroup
            className="block"
            value={nodeRadio}
            onChange={(value) => {
              setNodeRadio(value)
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
                  setBlock={(block) =>
                    updateNodeBlock(node, Math.max(block, highestBlock))
                  }
                >
                  <div>
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
                client={clients[CUSTOM_NODE_KEY]}
                highestBlock={highestBlock}
                setBlock={(block) =>
                  updateNodeBlock(
                    CUSTOM_NODE_KEY,
                    Math.max(block, highestBlock)
                  )
                }
              >
                <div className="flex w-full">
                  <Radio
                    id={`node-url-custom`}
                    value={CUSTOM_NODE_KEY}
                    label={
                      nodeRadio === CUSTOM_NODE_KEY || !!customNode
                        ? ''
                        : t('Other')
                    }
                  />
                  {(customNodeText || nodeRadio === CUSTOM_NODE_KEY) && (
                    <div className="flex w-full gap-8">
                      <Input
                        placeholder="https://"
                        value={customNodeText}
                        hasError={
                          !!customNodeText &&
                          !!(currentNodeError?.headline || currentNodeError?.message)
                        }
                        onChange={(e) => setCustomNodeText(e.target.value)}
                      />
                      <Link onClick={() => {
                        setNetworkError(null);
                        setCustomNode(customNodeText)
                      }}>
                        {getIsNodeLoading(state[CUSTOM_NODE_KEY])
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
        >
          {t('Connect')}
        </Button>
      </form>
    </div>
  );
};
