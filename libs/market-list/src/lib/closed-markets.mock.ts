import merge from 'lodash/merge';
import { subDays } from 'date-fns';
import type { PartialDeep, SetNonNullable, SetRequired } from 'type-fest';
import type {
  ClosedMarketFragment,
  ClosedMarketsQuery,
} from './__generated__/ClosedMarkets';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';

export function createClosedMarket(
  override?: PartialDeep<ClosedMarketFragment>
): SetNonNullable<SetRequired<ClosedMarketFragment, 'data'>> {
  const marketId = override?.id || 'market-id';
  const defaultMarket = {
    __typename: 'Market',
    id: marketId,
    decimalPlaces: 2,
    positionDecimalPlaces: 2,
    state: MarketState.STATE_SETTLED,
    tradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
    data: {
      __typename: 'MarketData',
      market: {
        __typename: 'Market',
        id: marketId,
      },
      bestBidPrice: '1000',
      bestOfferPrice: '2000',
      markPrice: '1500',
    },
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        id: '',
        name: 'ETH USDC SIMS 4',
        code: 'ETH/USDC',
        metadata: {
          __typename: 'InstrumentMetadata',
          tags: [],
        },
        product: {
          __typename: 'Future',
          settlementAsset: {
            __typename: 'Asset',
            id: 'c5b60dd43d99879d9881343227e788fe27a3e213cbd918e6f60d3d3973e24522',
            symbol: 'USDC',
            name: 'USDC SIM4',
            decimals: 18,
          },
          quoteName: 'USD',
          dataSourceSpecForTradingTermination: {
            __typename: 'DataSourceSpec',
            id: 'trading-terminated-property',
          },
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceSpec',
            id: 'settlement-data-property',
          },
          dataSourceSpecBinding: {
            __typename: 'DataSourceSpecToFutureBinding',
            settlementDataProperty: 'settlement-data-property',
            tradingTerminationProperty: 'trading-terminated-property',
          },
        },
      },
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      open: subDays(new Date(), 10).toISOString(),
      close: null,
    },
  };

  return merge(defaultMarket, override);
}

export function closedMarketsQuery(override?: PartialDeep<ClosedMarketsQuery>) {
  const defaultReult = {
    marketsConnection: {
      edges: [{ node: createClosedMarket() }],
    },
  };

  return merge(defaultReult, override);
}
