import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import type { NodeData } from '../../types';
import type createClient from '../../utils/apollo-client';
import { LayoutRow } from './layout-row';
import { LayoutCell } from './layout-cell';
import { NodeBlockHeight } from './node-block-height';

type NodeStatsContentProps = {
  data?: NodeData;
  highestBlock: number;
  setBlock: (value: number) => void;
  children?: ReactNode;
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

const getSslDisplayValue = (ssl?: NodeData['ssl']) => {
  if (ssl?.value) {
    return t('Yes');
  }
  if (ssl?.hasError) {
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
}: NodeStatsContentProps) => {
  return (
    <LayoutRow>
      {children}
      <LayoutCell
        label={t('Response time')}
        isLoading={data.responseTime?.isLoading}
        hasError={data.responseTime?.hasError}
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
      >
        {getBlockDisplayValue(data.block, setBlock)}
      </LayoutCell>
      <LayoutCell
        label={t('SSL')}
        isLoading={data.ssl?.isLoading}
        hasError={data.ssl?.hasError}
      >
        {getSslDisplayValue(data.ssl)}
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
      >
        {children}
      </NodeStatsContent>
    </Wrapper>
  );
};
