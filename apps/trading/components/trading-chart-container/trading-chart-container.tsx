import 'pennant/dist/style.css';

import { Chart as TradingChart, Interval } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';

export type TradingChartContainerProps = {
  marketId: string;
};

export const TradingChartContainer = ({
  marketId,
}: TradingChartContainerProps) => {
  const client = useApolloClient();
  const { keypair } = useVegaWallet();

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, keypair?.pub);
  }, [client, marketId, keypair]);

  return <TradingChart dataSource={dataSource} interval={Interval.I15M} />;
};
