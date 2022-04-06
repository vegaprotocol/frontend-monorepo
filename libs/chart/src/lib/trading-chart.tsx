import 'pennant/dist/style.css';

import { Chart as TradingChart, Interval } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useContext, useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ThemeContext } from '@vegaprotocol/react-helpers';

export type TradingChartContainerProps = {
  marketId: string;
};

export const TradingChartContainer = ({
  marketId,
}: TradingChartContainerProps) => {
  const client = useApolloClient();
  const { keypair } = useVegaWallet();
  const theme = useContext(ThemeContext);

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, keypair?.pub);
  }, [client, marketId, keypair]);

  return (
    <TradingChart
      dataSource={dataSource}
      interval={Interval.I15M}
      theme={theme}
    />
  );
};
