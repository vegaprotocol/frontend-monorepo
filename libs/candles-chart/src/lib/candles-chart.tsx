import 'pennant/dist/style.css';
import { CandlestickChart } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import { useCandlesChartSettings } from './use-candles-chart-settings';

export type CandlesChartContainerProps = {
  marketId: string;
};

const INITIAL_CANDLES_TO_ZOOM = 150;

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();

  const { interval, chartType, overlays, studies, merge } =
    useCandlesChartSettings();

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <CandlestickChart
      dataSource={dataSource}
      options={{
        chartType,
        overlays,
        studies,
        notEnoughDataText: (
          <span className="text-xs text-center">{t('No data')}</span>
        ),
        initialNumCandlesToDisplay: INITIAL_CANDLES_TO_ZOOM,
      }}
      interval={interval}
      theme={theme}
      onOptionsChanged={(options) => {
        merge({
          overlays: options.overlays,
          studies: options.studies,
        });
      }}
    />
  );
};
