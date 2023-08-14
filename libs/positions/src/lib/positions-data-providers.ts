import isEqual from 'lodash/isEqual';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { Account } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import { toBigNum, removePaginationWrapper } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import type {
  MarketMaybeWithData,
  MarketDataQueryVariables,
} from '@vegaprotocol/markets';
import { allMarketsWithLiveDataProvider } from '@vegaprotocol/markets';
import type {
  PositionsQuery,
  PositionFieldsFragment,
  PositionsSubscriptionSubscription,
  PositionsQueryVariables,
  PositionsSubscriptionSubscriptionVariables,
} from './__generated__/Positions';
import {
  PositionsDocument,
  PositionsSubscriptionDocument,
} from './__generated__/Positions';
import type { PositionStatus } from '@vegaprotocol/types';

export interface Position {
  assetId: string;
  assetSymbol: string;
  averageEntryPrice: string;
  currentLeverage: number | undefined;
  decimals: number;
  quantum: string;
  lossSocializationAmount: string;
  marginAccountBalance: string;
  marketDecimalPlaces: number;
  marketId: string;
  marketName: string;
  marketTradingMode: Schema.MarketTradingMode;
  markPrice: string | undefined;
  notional: string | undefined;
  openVolume: string;
  partyId: string;
  positionDecimalPlaces: number;
  realisedPNL: string;
  status: PositionStatus;
  totalBalance: string;
  unrealisedPNL: string;
  updatedAt: string | null;
  productType: string;
}

export const getMetrics = (
  data: ReturnType<typeof rejoinPositionData> | null,
  accounts: Account[] | null
): Position[] => {
  if (!data || !data?.length) {
    return [];
  }
  const metrics: Position[] = [];
  data.forEach((position) => {
    const market = position.market;
    if (!market) {
      return;
    }
    const marketData = market?.data;
    const marginAccount = accounts?.find((account) => {
      return account.market?.id === market?.id;
    });
    const {
      decimals,
      id: assetId,
      symbol: assetSymbol,
      quantum,
    } = market.tradableInstrument.instrument.product.settlementAsset;
    const generalAccount = accounts?.find(
      (account) =>
        account.asset.id === assetId &&
        account.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL
    );

    const { positionDecimalPlaces, decimalPlaces: marketDecimalPlaces } =
      market;
    const openVolume = toBigNum(position.openVolume, positionDecimalPlaces);

    const marginAccountBalance = toBigNum(
      marginAccount?.balance ?? 0,
      decimals
    );
    const generalAccountBalance = toBigNum(
      generalAccount?.balance ?? 0,
      decimals
    );

    const markPrice = marketData
      ? toBigNum(marketData.markPrice, marketDecimalPlaces)
      : undefined;
    const notional = markPrice
      ? (openVolume.isGreaterThan(0)
          ? openVolume
          : openVolume.multipliedBy(-1)
        ).multipliedBy(markPrice)
      : undefined;
    const totalBalance = marginAccountBalance.plus(generalAccountBalance);
    const currentLeverage = notional
      ? totalBalance.isEqualTo(0)
        ? new BigNumber(0)
        : notional.dividedBy(totalBalance)
      : undefined;
    metrics.push({
      assetId,
      assetSymbol,
      averageEntryPrice: position.averageEntryPrice,
      currentLeverage: currentLeverage ? currentLeverage.toNumber() : undefined,
      decimals,
      quantum,
      lossSocializationAmount: position.lossSocializationAmount || '0',
      marginAccountBalance: marginAccount?.balance ?? '0',
      marketDecimalPlaces,
      marketId: market.id,
      marketName: market.tradableInstrument.instrument.code,
      marketTradingMode: market.tradingMode,
      markPrice: marketData ? marketData.markPrice : undefined,
      notional: notional
        ? notional.multipliedBy(10 ** marketDecimalPlaces).toFixed(0)
        : undefined,
      openVolume: position.openVolume,
      partyId: position.party.id,
      positionDecimalPlaces,
      realisedPNL: position.realisedPNL,
      status: position.positionStatus,
      totalBalance: totalBalance.multipliedBy(10 ** decimals).toFixed(),
      unrealisedPNL: position.unrealisedPNL,
      updatedAt: position.updatedAt || null,
      productType:
        market?.tradableInstrument.instrument.product.__typename || '',
    });
  });
  return metrics;
};

export const update = (
  data: PositionFieldsFragment[] | null,
  deltas: PositionsSubscriptionSubscription['positions']
) => {
  const updatedData = produce(data || [], (draft) => {
    deltas.forEach((delta) => {
      const { marketId, partyId, __typename, ...position } = delta;
      const index = draft.findIndex(
        (node) =>
          node.market.id === delta.marketId && node.party.id === delta.partyId
      );
      if (index !== -1) {
        const currNode = draft[index];
        draft[index] = {
          ...currNode,
          ...position,
        };
      } else {
        draft.unshift({
          ...position,
          __typename: 'Position',
          market: {
            __typename: 'Market',
            id: delta.marketId,
          },
          party: {
            __typename: 'Party',
            id: delta.partyId,
          },
        });
      }
    });
  });
  return updatedData;
};

const getSubscriptionVariables = (
  variables: PositionsQueryVariables
): PositionsSubscriptionSubscriptionVariables[] =>
  ([] as string[]).concat(variables.partyIds).map((partyId) => ({ partyId }));

const positionsDataProvider = makeDataProvider<
  PositionsQuery,
  PositionFieldsFragment[],
  PositionsSubscriptionSubscription,
  PositionsSubscriptionSubscription['positions'],
  PositionsQueryVariables,
  PositionsSubscriptionSubscriptionVariables
>({
  query: PositionsDocument,
  subscriptionQuery: PositionsSubscriptionDocument,
  update,
  getData: (responseData: PositionsQuery | null) =>
    removePaginationWrapper(responseData?.positions?.edges) || [],
  getDelta: (subscriptionData: PositionsSubscriptionSubscription) =>
    subscriptionData.positions,
  getSubscriptionVariables,
  fetchPolicy: 'no-cache',
});

const positionDataProvider = makeDerivedDataProvider<
  PositionFieldsFragment,
  never,
  PositionsQueryVariables & MarketDataQueryVariables
>(
  [
    (callback, client, variables) =>
      positionsDataProvider(callback, client, {
        partyIds: variables.partyIds,
      }),
  ],
  (data, variables) => {
    return (
      (data[0] as PositionFieldsFragment[] | null)?.find(
        (p) => p.market.id === variables?.marketId
      ) || null
    );
  }
);

export const openVolumeDataProvider = makeDerivedDataProvider<
  string,
  never,
  PositionsQueryVariables & MarketDataQueryVariables
>(
  [positionDataProvider],
  (data) => (data[0] as PositionFieldsFragment | null)?.openVolume || null
);

export const rejoinPositionData = (
  positions: PositionFieldsFragment[] | null,
  marketsData: MarketMaybeWithData[] | null
):
  | (Omit<PositionFieldsFragment, 'market'> & {
      market: MarketMaybeWithData | null;
    })[]
  | null => {
  if (positions && marketsData) {
    return positions.map((node) => {
      const market =
        marketsData?.find((market) => market.id === node.market.id) || null;
      return {
        ...node,
        market,
      };
    });
  }
  return null;
};

export const positionsMarketsProvider = makeDerivedDataProvider<
  string[],
  never,
  PositionsQueryVariables
>([positionsDataProvider], ([positions]) => {
  return Array.from(
    new Set(
      (positions as PositionFieldsFragment[]).map(
        (position) => position.market.id
      )
    )
  ).sort();
});

export const positionsMetricsProvider = makeDerivedDataProvider<
  Position[],
  Position[],
  PositionsQueryVariables & { marketIds: string[] }
>(
  [
    (callback, client, variables) =>
      positionsDataProvider(callback, client, { partyIds: variables.partyIds }),
    (callback, client, variables) =>
      accountsDataProvider(callback, client, {
        partyId: Array.isArray(variables.partyIds)
          ? variables.partyIds[0]
          : variables.partyIds,
      }),
    (callback, client, variables) =>
      allMarketsWithLiveDataProvider(callback, client, {
        marketIds: variables.marketIds,
      }),
  ],
  ([positions, accounts, marketsData]) => {
    const positionsData = rejoinPositionData(positions, marketsData);
    const metrics = getMetrics(positionsData, accounts as Account[] | null);
    return sortBy(metrics, 'marketName');
  },
  (data, delta, previousData) =>
    data.filter((row) => {
      const previousRow = previousData?.find(
        (previousRow) => previousRow.marketId === row.marketId
      );
      return !(previousRow && isEqual(previousRow, row));
    })
);
