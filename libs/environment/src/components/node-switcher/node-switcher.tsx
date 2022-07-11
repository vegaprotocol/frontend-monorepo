import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { RadioGroup, Button, Radio } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '../../hooks/use-environment';
import type { Configuration, NodeData, Networks } from '../../types';
import { LayoutRow } from './layout-row';
import { LayoutCell } from './layout-cell';
import { NodeError } from './node-error';
import { NodeStats } from './node-stats';

type NodeSwitcherProps = {
  error?: string;
  config: Configuration;
  onConnect: (url: string) => void;
};

const getDefaultNode = (urls: string[], currentUrl?: string) => {
  return currentUrl && urls.includes(currentUrl) ? currentUrl : undefined;
};

const getIsLoading = ({ chain, responseTime, block, ssl }: NodeData) => {
  return (
    chain.isLoading ||
    responseTime.isLoading ||
    block.isLoading ||
    ssl.isLoading
  );
};

const getHasMatchingChain = (env: Networks, chain?: string) => {
  return chain?.includes(env.toLowerCase()) ?? false;
};

const getIsDisabled = (env: Networks, data: NodeData) => {
  const { chain, responseTime, block, ssl } = data;
  return (
    !getHasMatchingChain(env, data.chain.value) ||
    getIsLoading(data) ||
    chain.hasError ||
    responseTime.hasError ||
    block.hasError ||
    ssl.hasError
  );
};

export const NodeSwitcher = ({ config, onConnect }: NodeSwitcherProps) => {
  const { VEGA_ENV, VEGA_URL } = useEnvironment();
  const [node, setNode] = useState(getDefaultNode(config.hosts, VEGA_URL));
  const [highestBlock, setHighestBlock] = useState(0);

  const onSubmit = (node: ReturnType<typeof getDefaultNode>) => {
    if (node) {
      onConnect(node);
    }
  };

  const isSubmitDisabled = !node;

  return (
    <div className="text-black dark:text-white w-full">
      <NodeError />
      <form onSubmit={() => onSubmit(node)}>
        <p className="text-body-large font-bold mb-32">
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
            value={node}
            onChange={(value) => setNode(value)}
          >
            <div>
              {config.hosts.map((url, index) => (
                <NodeStats
                  key={index}
                  url={url}
                  highestBlock={highestBlock}
                  setBlock={(block) =>
                    setHighestBlock(Math.max(block, highestBlock))
                  }
                  render={(data) => (
                    <div>
                      <Radio
                        id={`node-url-${index}`}
                        labelClassName="whitespace-nowrap text-ellipsis overflow-hidden"
                        value={url}
                        label={url}
                        disabled={getIsDisabled(VEGA_ENV, data)}
                      />
                    </div>
                  )}
                />
              ))}
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
