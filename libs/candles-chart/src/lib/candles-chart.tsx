import 'pennant/dist/style.css';
import debounce from 'lodash/debounce';
import { CandlestickChart } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import { useCandlesChartSettings } from './use-candles-chart-settings';

export type CandlesChartContainerProps = {
  marketId: string;
};

const CANDLES_TO_WIDTH_FACTOR = 0.15;

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();

  const { interval, chartType, overlays, studies, studySizes, merge } =
    useCandlesChartSettings();

  const handlePaneChange = useMemo(
    () =>
      debounce((sizes: number[]) => {
        // first number is main pain, which is greedy so we don't store it
        merge({
          studySizes: sizes.filter((_, i) => i !== 0),
        });
      }, 300),
    [merge]
  );

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <div style={{ width, height }}>
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
              studySize: 150, // default size
              studySizes,
            }}
            interval={interval}
            theme={theme}
            onOptionsChanged={(options) => {
              merge({
                overlays: options.overlays,
                studies: options.studies,
              });
            }}
            onPaneChanged={handlePaneChange}
          />
        </div>
      )}
    </AutoSizer>
  );
};
