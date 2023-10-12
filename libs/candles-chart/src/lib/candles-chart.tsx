import 'pennant/dist/style.css';
import { CandlestickChart } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useMemo } from 'react';
import debounce from 'lodash/debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  STUDY_SIZE,
  useCandlesChartSettings,
} from './use-candles-chart-settings';
import { useT } from './use-t';

export type CandlesChartContainerProps = {
  marketId: string;
};

const CANDLES_TO_WIDTH_FACTOR = 0.2;

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();
  const t = useT();

  const {
    interval,
    chartType,
    overlays,
    studies,
    studySizes,
    setStudies,
    setStudySizes,
    setOverlays,
  } = useCandlesChartSettings();

  const handlePaneChange = useMemo(
    () =>
      debounce((sizes: number[]) => {
        // first number is main pain, which is greedy so we don't store it
        setStudySizes(sizes.filter((_, i) => i !== 0));
      }, 300),
    [setStudySizes]
  );

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <AutoSizer>
      {({ width, height }) => {
        const candlesCount = Math.floor(width * CANDLES_TO_WIDTH_FACTOR);
        return (
          <div style={{ width, height }}>
            <CandlestickChart
              dataSource={dataSource}
              options={{
                chartType,
                overlays,
                studies,
                notEnoughDataText: (
                  <span className="text-xs text-center">
                    {t('No open orders')}
                  </span>
                ),
                initialNumCandlesToDisplay: candlesCount,
                studySize: STUDY_SIZE,
                studySizes,
              }}
              interval={interval}
              theme={theme}
              onOptionsChanged={(options) => {
                setStudies(options.studies);
                setOverlays(options.overlays);
              }}
              onPaneChanged={handlePaneChange}
            />
          </div>
        );
      }}
    </AutoSizer>
  );
};
