import type * as Types from '@vegaprotocol/types';
import {
  isFuture,
  isPerpetual,
  isSpot,
  OPEN_MARKETS_STATES,
  CLOSED_MARKETS_STATES,
  PROPOSED_MARKETS_STATES,
  retrieveAssets,
  calcTradedFactor,
} from '@vegaprotocol/markets';
import { type Market } from '@vegaprotocol/data-provider';
import { create } from 'zustand';
import intersection from 'lodash/intersection';
import orderBy from 'lodash/orderBy';
import { priceChangePercentage } from '@vegaprotocol/utils';
import omit from 'lodash/omit';

export const MarketType = {
  FUTURE: 'FUTURE',
  PERPETUAL: 'PERPETUAL',
  SPOT: 'SPOT',
} as const;

export type IMarketType = keyof typeof MarketType;

export const MarketState = {
  OPEN: 'OPEN',
  PROPOSED: 'PROPOSED',
  CLOSED: 'CLOSED',
} as const;

export type IMarketState = keyof typeof MarketState;

export const SortOption = {
  GAINED: 'GAINED',
  LOST: 'LOST',
  NEW: 'NEW',
  TOP_TRADED: 'TOP_TRADED',
} as const;

export type ISortOption = keyof typeof SortOption;

export type Filters = {
  marketTypes: IMarketType[];
  marketStates: IMarketState[];
  assets: string[];
  searchTerm: string | undefined;
  sortOrder: ISortOption;
};

type Actions = {
  setMarketTypes: (marketTypes: IMarketType[]) => void;
  setMarketStates: (marketSates: IMarketState[]) => void;
  setAssets: (assets: string[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSortOrder: (sortOrder: ISortOption) => void;
  reset: () => void;
};

export const DEFAULT_FILTERS: Filters = {
  marketTypes: [],
  marketStates: ['OPEN'],
  assets: [],
  searchTerm: '',
  sortOrder: SortOption.TOP_TRADED,
};

export const useMarketFiltersStore = create<Filters & Actions>()((set) => ({
  ...DEFAULT_FILTERS,
  setMarketTypes: (marketTypes) => set({ marketTypes }),
  setMarketStates: (marketStates) => set({ marketStates }),
  setAssets: (assets) => set({ assets }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  reset: () => set(omit(DEFAULT_FILTERS, 'sortOrder')),
}));

const isOfTypes = (market: Market, marketTypes: IMarketType[]) => {
  let marketType: IMarketType | undefined = undefined;
  const product = market?.tradableInstrument?.instrument?.product;
  if (product) {
    if (isFuture(product)) marketType = MarketType.FUTURE;
    if (isPerpetual(product)) marketType = MarketType.PERPETUAL;
    if (isSpot(product)) marketType = MarketType.SPOT;
  }
  return marketType && marketTypes.includes(marketType);
};

const isOfStates = (market: Market, marketStates: IMarketState[]) => {
  let states: Types.MarketState[] = [];
  if (marketStates.includes('OPEN')) {
    states = [...states, ...OPEN_MARKETS_STATES];
  }
  if (marketStates.includes('CLOSED')) {
    states = [...states, ...CLOSED_MARKETS_STATES];
  }
  if (marketStates.includes('PROPOSED')) {
    states = [...states, ...PROPOSED_MARKETS_STATES];
  }

  const marketState = market.data?.marketState;
  return marketState && states.includes(marketState);
};

const isOfAssets = (market: Market, assets: string[]) => {
  const product = market.tradableInstrument?.instrument?.product;
  if (product) {
    const marketAssets = retrieveAssets(product).map((a) => a.id);
    return intersection(assets, marketAssets).length > 0;
  }
  return false;
};

const nameOrCodeMatches = (market: Market, term: string) => {
  const name = market.tradableInstrument.instrument.name;
  const code = market.tradableInstrument.instrument.code;
  const re = new RegExp(term, 'ig');
  return re.test(name) || re.test(code);
};

export const filterMarket = (market: Market, filters: Partial<Filters>) => {
  let passes = true;
  const { marketTypes, marketStates, assets, searchTerm } = filters;

  // filter by market type
  if (
    marketTypes &&
    marketTypes.length > 0 &&
    !isOfTypes(market, marketTypes)
  ) {
    passes = false;
  }

  // filter by state
  if (
    marketStates &&
    marketStates.length > 0 &&
    !isOfStates(market, marketStates)
  ) {
    passes = false;
  }

  // filter by asset
  if (assets && assets.length > 0 && !isOfAssets(market, assets)) {
    passes = false;
  }

  // filter by name or code
  if (
    searchTerm &&
    searchTerm.length > 0 &&
    !nameOrCodeMatches(market, searchTerm)
  ) {
    passes = false;
  }

  return passes;
};

export const filterMarkets = (markets: Market[], filters: Partial<Filters>) =>
  markets.filter((m) => filterMarket(m, filters));

export const orderMarkets = (markets: Market[], sortOrder?: ISortOption) => {
  if (!sortOrder) return markets;

  switch (sortOrder) {
    case SortOption.GAINED:
    case SortOption.LOST: {
      const dir = sortOrder === SortOption.GAINED ? 'desc' : 'asc';
      return orderBy(
        markets,
        [
          (m) => {
            if (!m.candlesConnection?.edges?.length) return 0;
            return Number(
              priceChangePercentage(
                m.candlesConnection.edges
                  .filter((c) => c?.node.close !== '')
                  .map((c) => c!.node.close)
              )
            );
          },
        ],
        [dir]
      );
    }
    case SortOption.NEW: {
      return orderBy(
        markets,
        [(m) => new Date(m.marketTimestamps.open).getTime()],
        ['desc']
      );
    }
    case SortOption.TOP_TRADED: {
      return markets;
      // TODO: fix me
      // return orderBy(markets, [(m) => calcTradedFactor(m)], ['desc']);
    }
  }
};
