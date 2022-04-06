import 'pennant/dist/style.css';

import { addDecimal, ThemeContext } from '@vegaprotocol/react-helpers';
import { DepthChart } from 'pennant';
import type { DepthChartProps } from 'pennant';
import { Splash } from '@vegaprotocol/ui-toolkit';
import type { marketDepthUpdateSubscribe_marketDepthUpdate_sell } from './__generated__/marketDepthUpdateSubscribe';

import { useContext } from 'react';
import { useDepthUpdate } from './hooks/use-depth-update';

type PriceLevel = Pick<
  marketDepthUpdateSubscribe_marketDepthUpdate_sell,
  'price' | 'volume'
>;

export type DepthChartContainerProps = {
  marketId: string;
};

export const DepthChartContainer = ({ marketId }: DepthChartContainerProps) => {
  const theme = useContext(ThemeContext);

  const { data, loading, error } = useDepthUpdate({ marketId }, 500);

  if (error) {
    return <Splash>Error</Splash>;
  }

  if (loading) {
    return <Splash>Loading...</Splash>;
  }

  if (!data?.market) {
    return <Splash>No Data</Splash>;
  }

  const market = data.market;
  const depthData: DepthChartProps['data'] = { buy: [], sell: [] };

  if (market.depth) {
    if (market.depth.buy) {
      depthData.buy = market?.depth.buy?.map((priceLevel: PriceLevel) => ({
        price: Number(
          addDecimal(priceLevel.price, data?.market?.decimalPlaces ?? 0)
        ),
        volume: Number(priceLevel.volume),
      }));
    }

    if (market.depth.sell) {
      depthData.sell = market?.depth.sell?.map((priceLevel: PriceLevel) => ({
        price: Number(
          addDecimal(priceLevel.price, data?.market?.decimalPlaces ?? 0)
        ),
        volume: Number(priceLevel.volume),
      }));
    }
  }

  return <DepthChart data={depthData} theme={theme} />;
};
