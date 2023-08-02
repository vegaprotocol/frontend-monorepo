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

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();

  const settings = useCandlesChartSettings();

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <CandlestickChart
      dataSource={dataSource}
      options={{
        chartType: settings.type,
        overlays: settings.overlays,
        studies: settings.studies,
        notEnoughDataText: (
          <span className="text-xs text-center">{t('No data')}</span>
        ),
      }}
      interval={settings.interval}
      theme={theme}
      onOptionsChanged={(options) => {
        settings.merge({
          overlays: options.overlays,
          studies: options.studies,
        });
      }}
    />
  );
};
