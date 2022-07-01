import type { ReactNode } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { ApolloProvider } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import type { NodeData } from '../../types';
import { createClient } from '../../utils/apollo-client';
import { useNode } from '../../hooks/use-node';
import { LayoutRow } from './layout-row';
import { LayoutCell } from './layout-cell';
import { NodeBlockHeight } from './node-block-height';

type NodeStatsContentProps = {
  data: NodeData;
  highestBlock: number;
  setBlock: (value: number) => void;
  children: ReactNode;
};

const getResponseTimeDisplayValue = (
  responseTime: NodeData['responseTime']
) => {
  if (typeof responseTime.value === 'number') {
    return `${Number(responseTime.value).toFixed(2)}ms`;
  }
  if (responseTime.hasError) {
    return t('n/a');
  }
  return '-';
};

const getBlockDisplayValue = (block: NodeData['block']) => {
  if (block.value) {
    return '';
  }
  if (block.hasError) {
    return t('n/a');
  }
  return '-';
};

const getSslDisplayValue = (ssl: NodeData['ssl']) => {
  if (ssl.value) {
    return t('Yes');
  }
  if (ssl.hasError) {
    return t('No');
  }
  return '-';
};

const NodeStatsContent = ({
  data: { url, responseTime, block, ssl },
  highestBlock,
  setBlock,
  children,
}: NodeStatsContentProps) => {
  return (
    <LayoutRow>
      {children}
      <LayoutCell
        isLoading={responseTime.isLoading}
        hasError={responseTime.hasError}
      >
        {getResponseTimeDisplayValue(responseTime)}
      </LayoutCell>
      <LayoutCell
        isLoading={block.isLoading}
        hasError={
          block.hasError || (!!block.value && highestBlock > block.value)
        }
      >
        {url && block.value && (
          <NodeBlockHeight value={block.value} setValue={setBlock} />
        )}
        {getBlockDisplayValue(block)}
      </LayoutCell>
      <LayoutCell isLoading={ssl.isLoading} hasError={ssl.hasError}>
        {getSslDisplayValue(ssl)}
      </LayoutCell>
    </LayoutRow>
  );
};

type WrapperProps = {
  client?: ReturnType<typeof createClient>;
  children: ReactNode;
};

const Wrapper = ({ client, children }: WrapperProps) => {
  if (client) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export type NodeStatsProps = {
  url?: string;
  highestBlock: number;
  setBlock: (value: number) => void;
  render: (data: NodeData) => ReactNode;
};

export const NodeStats = ({
  url,
  highestBlock,
  render,
  setBlock,
}: NodeStatsProps) => {
  const [client, setClient] = useState<
    undefined | ReturnType<typeof createClient>
  >();
  const { state, reset, updateBlockState } = useNode(url, client);

  useEffect(() => {
    client?.stop();
    reset();
    setClient(url ? createClient(url) : undefined);
    return () => client?.stop();
  }, [url]);

  const onHandleBlockChange = useCallback(
    (value: number) => {
      updateBlockState(value);
      setBlock(value);
    },
    [updateBlockState, setBlock]
  );

  return (
    <Wrapper client={client}>
      <NodeStatsContent
        data={state}
        highestBlock={highestBlock}
        setBlock={onHandleBlockChange}
      >
        {render(state)}
      </NodeStatsContent>
    </Wrapper>
  );
};
