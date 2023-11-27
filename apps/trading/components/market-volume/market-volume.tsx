import { useCallback, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { MarketData } from '@vegaprotocol/markets';
import { marketDataProvider, marketProvider } from '@vegaprotocol/markets';
import { HeaderStat } from '../header';
import * as constants from '../constants';
import { useT } from '../../lib/use-t';

export const MarketVolume = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const [marketVolume, setMarketVolume] = useState<string>('-');
  const variables = { marketId };
  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const throttledSetMarketVolume = useRef(
    throttle((volume: string) => {
      setMarketVolume(volume);
    }, constants.THROTTLE_UPDATE_TIME)
  ).current;
  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      throttledSetMarketVolume(
        marketData?.indicativeVolume &&
          data?.positionDecimalPlaces !== undefined
          ? addDecimalsFormatNumber(
              marketData.indicativeVolume,
              data.positionDecimalPlaces
            )
          : '-'
      );
      return true;
    },
    [data?.positionDecimalPlaces, throttledSetMarketVolume]
  );

  useDataProvider({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: !marketId || !data,
  });

  return (
    <HeaderStat heading={t('Volume')} testId="market-volume">
      <div>{marketVolume}</div>
    </HeaderStat>
  );
};
