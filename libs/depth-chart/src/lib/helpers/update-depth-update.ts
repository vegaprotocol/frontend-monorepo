import type {
  marketDepth,
  marketDepth_market_depth,
} from '../__generated__/marketDepth';
import type { marketDepthUpdateSubscribe } from '../__generated__/marketDepthUpdateSubscribe';
import sortBy from 'lodash/sortBy';

type MarketDepth = Pick<marketDepth_market_depth, 'buy' | 'sell'>;

export function updateDepthUpdate(
  prev: marketDepth,
  subscriptionData: { data: marketDepthUpdateSubscribe }
): marketDepth {
  if (!subscriptionData.data.marketDepthUpdate || !prev.market) {
    return prev;
  }

  return {
    ...prev,
    market: {
      ...prev.market,
      ...(prev.market.data && {
        data: {
          ...prev.market.data,
          midPrice:
            subscriptionData.data.marketDepthUpdate.market.data?.midPrice ??
            prev.market.data.midPrice,
        },
      }),
      depth: {
        ...prev.market.depth,
        ...merge(prev.market.depth, subscriptionData.data.marketDepthUpdate),
      },
    },
  };
}

function merge(snapshot: MarketDepth, update: MarketDepth): MarketDepth {
  let buy = snapshot.buy ? [...snapshot.buy] : null;
  let sell = snapshot.sell ? [...snapshot.sell] : null;

  if (buy !== null) {
    if (update.buy !== null) {
      for (const priceLevel of update.buy) {
        const index = buy.findIndex(
          (level) => level.price === priceLevel.price
        );

        if (index !== -1) {
          if (priceLevel.volume !== '0') {
            buy.splice(index, 1, priceLevel);
          } else {
            buy.splice(index, 1);
          }
        } else {
          buy.push(priceLevel);
        }
      }
    }
  } else {
    buy = update.buy;
  }

  if (sell !== null) {
    if (update.sell !== null) {
      for (const priceLevel of update.sell) {
        const index = sell.findIndex(
          (level) => level.price === priceLevel.price
        );

        if (index !== -1) {
          if (priceLevel.volume !== '0') {
            sell.splice(index, 1, priceLevel);
          } else {
            sell.splice(index, 1);
          }
        } else {
          sell.push(priceLevel);
        }
      }
    }
  } else {
    sell = update.sell;
  }

  return {
    buy: sortBy(buy, (d) => -parseInt(d.price)),
    sell: sortBy(sell, (d) => parseInt(d.price)),
  };
}
