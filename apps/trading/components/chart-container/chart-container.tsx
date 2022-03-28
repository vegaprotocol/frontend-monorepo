import { useApolloClient } from '@apollo/client';
import { Market_market } from '@vegaprotocol/graphql';
import { Chart } from '@vegaprotocol/chart';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import { VegaDataSource } from './data-source';
import { Interval } from 'pennant';

interface ChartContainerProps {
  market: Market_market;
}

export const ChartContainer = ({ market }: ChartContainerProps) => {
  const client = useApolloClient();
  const { keypair } = useVegaWallet();

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, market.id, keypair.pub);
  }, [client, market.id, keypair.pub]);

  return <Chart dataSource={dataSource} interval={Interval.I15M} />;
};
