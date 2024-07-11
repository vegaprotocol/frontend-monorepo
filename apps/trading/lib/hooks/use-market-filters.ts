import type * as Types from '@vegaprotocol/types';
import {
  type MarketMaybeWithCandles,
  isFuture,
  isPerpetual,
  isSpot,
  OPEN_MARKETS_STATES,
  CLOSED_MARKETS_STATES,
  PROPOSED_MARKETS_STATES,
  retrieveAssets,
} from '@vegaprotocol/markets';
import { create } from 'zustand';
import intersection from 'lodash/intersection';

export type MarketType = 'FUTR' | 'PERP' | 'SPOT';
export type MarketState = 'OPEN' | 'PROPOSED' | 'CLOSED';

export type Filters = {
  marketTypes: MarketType[];
  marketStates: MarketState[];
  assets: string[];
  searchTerm: string | undefined;
};

type Actions = {
  setMarketTypes: (marketTypes: MarketType[]) => void;
  setMarketStates: (marketSates: MarketState[]) => void;
  setAssets: (assets: string[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  reset: () => void;
};

export const DEFAULT_FILTERS: Filters = {
  marketTypes: [],
  marketStates: ['OPEN'],
  assets: [],
  searchTerm: '',
};

export const useMarketFiltersStore = create<Filters & Actions>()((set) => ({
  ...DEFAULT_FILTERS,
  setMarketTypes: (marketTypes) => set({ marketTypes }),
  setMarketStates: (marketStates) => set({ marketStates }),
  setAssets: (assets) => set({ assets }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  reset: () => set(DEFAULT_FILTERS),
}));

const isOfTypes = (
  market: MarketMaybeWithCandles,
  marketTypes: MarketType[]
) => {
  let marketType: MarketType | undefined = undefined;
  const product = market?.tradableInstrument?.instrument?.product;
  if (product) {
    if (isFuture(product)) marketType = 'FUTR';
    if (isPerpetual(product)) marketType = 'PERP';
    if (isSpot(product)) marketType = 'SPOT';
  }
  return marketType && marketTypes.includes(marketType);
};

const isOfStates = (
  market: MarketMaybeWithCandles,
  marketStates: MarketState[]
) => {
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

const isOfAssets = (market: MarketMaybeWithCandles, assets: string[]) => {
  const product = market.tradableInstrument?.instrument?.product;
  if (product) {
    const marketAssets = retrieveAssets(product).map((a) => a.id);
    return intersection(assets, marketAssets).length > 0;
  }
  return false;
};

const nameOrCodeMatches = (market: MarketMaybeWithCandles, term: string) => {
  const name = market.tradableInstrument.instrument.name;
  const code = market.tradableInstrument.instrument.code;
  const re = new RegExp(term, 'ig');
  return re.test(name) || re.test(code);
};

export const filterMarket = (
  market: MarketMaybeWithCandles,
  { marketTypes, marketStates, assets, searchTerm }: Filters
) => {
  let passes = true;

  // filter by market type
  if (marketTypes.length > 0 && !isOfTypes(market, marketTypes)) {
    passes = false;
  }

  // filter by state
  if (marketStates.length > 0 && !isOfStates(market, marketStates)) {
    passes = false;
  }

  // filter by asset
  if (assets.length > 0 && !isOfAssets(market, assets)) {
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

export const filterMarkets = (
  markets: MarketMaybeWithCandles[],
  filters: Filters
) => markets.filter((m) => filterMarket(m, filters));
