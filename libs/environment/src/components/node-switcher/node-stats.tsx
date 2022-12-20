import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import type { NodeData } from '../../types';
import { LayoutRow } from './layout-row';
import { LayoutCell } from './layout-cell';
import { NodeBlockHeight } from './node-block-height';
import type { createClient } from '@vegaprotocol/apollo-client';

type NodeStatsContentProps = {
  data?: NodeData;
  highestBlock: number;
  setBlock: (value: number) => void;
  children?: ReactNode;
  dataTestId?: string;
};

const getResponseTimeDisplayValue = (
  responseTime?: NodeData['responseTime']
) => {
  if (typeof responseTime?.value === 'number') {
    return `${Number(responseTime.value).toFixed(2)}ms`;
  }
  if (responseTime?.hasError) {
    return t('n/a');
  }
  return '-';
};

const getBlockDisplayValue = (
  block: NodeData['block'] | undefined,
  setBlock: (block: number) => void
) => {
  if (block?.value) {
    return <NodeBlockHeight value={block?.value} setValue={setBlock} />;
  }
  if (block?.hasError) {
    return t('n/a');
  }
  return '-';
};

const getSubscriptionDisplayValue = (
  subscription?: NodeData['subscription']
) => {
  if (subscription?.value) {
    return t('Yes');
  }
  if (subscription?.hasError) {
    return t('No');
  }
  return '-';
};

const NodeStatsContent = ({
  // @ts-ignore Allow defaulting to an empty object
  data = {},
  highestBlock,
  setBlock,
  children,
  dataTestId,
}: NodeStatsContentProps) => {
  return (
    <LayoutRow dataTestId={dataTestId}>
      {children}
      <LayoutCell
        label={t('Response time')}
        isLoading={data.responseTime?.isLoading}
        hasError={data.responseTime?.hasError}
        dataTestId="response-time-cell"
      >
        {getResponseTimeDisplayValue(data.responseTime)}
      </LayoutCell>
      <LayoutCell
        label={t('Block')}
        isLoading={data.block?.isLoading}
        hasError={
          data.block?.hasError ||
          (!!data.block?.value && highestBlock > data.block.value)
        }
        dataTestId="block-cell"
      >
        {getBlockDisplayValue(data.block, setBlock)}
      </LayoutCell>
      <LayoutCell
        label={t('Subscription')}
        isLoading={data.subscription?.isLoading}
        hasError={data.subscription?.hasError}
        dataTestId="subscription-cell"
      >
        {getSubscriptionDisplayValue(data.subscription)}
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
  data?: NodeData;
  client?: ReturnType<typeof createClient>;
  highestBlock: number;
  setBlock: (value: number) => void;
  children?: ReactNode;
};

export const NodeStats = ({
  data,
  client,
  highestBlock,
  children,
  setBlock,
}: NodeStatsProps) => {
  return (
    <Wrapper client={client}>
      <NodeStatsContent
        data={data}
        highestBlock={highestBlock}
        setBlock={setBlock}
        dataTestId="node-row"
      >
        {children}
      </NodeStatsContent>
    </Wrapper>
  );
};
