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
  headers?: {
    blockHeight: number;
    timestamp: Date;
  };
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
  block: number | undefined,
  setBlock: (block: number) => void
) => {
  if (block) {
    return <NodeBlockHeight value={block} setValue={setBlock} />;
  }
  if (!block) {
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
  headers,
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
        label={t('Header block')}
        isLoading={false}
        hasError={headers ? highestBlock - 3 > headers.blockHeight : false}
        dataTestId="header-block-cell"
      >
        {getBlockDisplayValue(headers?.blockHeight, setBlock)}
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
  headers: {
    blockHeight: number;
    timestamp: Date;
  };
};

export const NodeStats = ({
  data,
  client,
  highestBlock,
  children,
  setBlock,
  headers,
}: NodeStatsProps) => {
  return (
    <Wrapper client={client}>
      <NodeStatsContent
        data={data}
        highestBlock={highestBlock}
        setBlock={setBlock}
        dataTestId="node-row"
        headers={headers}
      >
        {children}
      </NodeStatsContent>
    </Wrapper>
  );
};
