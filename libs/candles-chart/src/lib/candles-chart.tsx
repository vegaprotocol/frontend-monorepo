import 'pennant/dist/style.css';

import { Chart, Interval } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useContext, useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ThemeContext } from '@vegaprotocol/react-helpers';

export type CandlesChartContainerProps = {
  marketId: string;
};

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { keypair } = useVegaWallet();
  const theme = useContext(ThemeContext);

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, keypair?.pub);
  }, [client, marketId, keypair]);

  return (
    <Chart dataSource={dataSource} interval={Interval.I15M} theme={theme} />
  );
};
