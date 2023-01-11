import isEqual from 'lodash/isEqual';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { Account } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import { toBigNum } from '@vegaprotocol/react-helpers';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import type { MarketMaybeWithData } from '@vegaprotocol/market-list';
import { marketsWithDataProvider } from '@vegaprotocol/market-list';
import type {
  PositionsQuery,
  PositionsSubscriptionSubscription,
  MarginsQuery,
  MarginFieldsFragment,
} from './__generated__/Positions';
import {
  PositionsDocument,
  PositionsSubscriptionDocument,
} from './__generated__/Positions';
import { marginsDataProvider } from './margin-data-provider';

type PositionMarginLevel = Pick<
  MarginFieldsFragment,
  'maintenanceLevel' | 'searchLevel' | 'initialLevel'
>;

interface PositionRejoined {
  realisedPNL: string;
  openVolume: string;
  unrealisedPNL: string;
  averageEntryPrice: string;
  updatedAt?: string | null;
  market: MarketMaybeWithData | null;
  margins: PositionMarginLevel | null;
}

export interface Position {
  marketName: string;
  averageEntryPrice: string;
  marginAccountBalance: string;
  capitalUtilisation: number;
  currentLeverage: number;
  decimals: number;
  marketDecimalPlaces: number;
  positionDecimalPlaces: number;
  totalBalance: string;
  assetSymbol: string;
  liquidationPrice: string;
  lowMarginLevel: boolean;
  marketId: string;
  marketTradingMode: Schema.MarketTradingMode;
  markPrice: string;
  notional: string;
  openVolume: string;
  realisedPNL: string;
  unrealisedPNL: string;
  searchPrice: string;
  updatedAt: string | null;
}

export interface Data {
  party: PositionsQuery['party'] | null;
  positions: Position[] | null;
}

export const getMetrics = (
  data: PositionRejoined[] | null,
  accounts: Account[] | null
): Position[] => {
  if (!data || !data?.length) {
    return [];
  }
  const metrics: Position[] = [];
  data.forEach((position) => {
    const market = position.market;
    const marketData = market?.data;
    const marginLevel = position.margins;
    const marginAccount = accounts?.find((account) => {
      return account.market?.id === market?.id;
    });
    if (!marginAccount || !marginLevel || !market || !marketData) {
      return;
    }
    const generalAccount = accounts?.find(
      (account) =>
        account.asset.id === marginAccount.asset.id &&
        account.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL
    );
    const decimals = marginAccount.asset.decimals;
    const { positionDecimalPlaces, decimalPlaces: marketDecimalPlaces } =
      market;
    const openVolume = toBigNum(position.openVolume, positionDecimalPlaces);

    const marginAccountBalance = toBigNum(marginAccount.balance ?? 0, decimals);
    const generalAccountBalance = toBigNum(
      generalAccount?.balance ?? 0,
      decimals
    );
    const markPrice = toBigNum(marketData.markPrice, marketDecimalPlaces);

    const notional = (
      openVolume.isGreaterThan(0) ? openVolume : openVolume.multipliedBy(-1)
    ).multipliedBy(markPrice);
    const totalBalance = marginAccountBalance.plus(generalAccountBalance);
    const currentLeverage = totalBalance.isEqualTo(0)
      ? new BigNumber(0)
      : notional.dividedBy(totalBalance);
    const capitalUtilisation = totalBalance.isEqualTo(0)
      ? new BigNumber(0)
      : marginAccountBalance.dividedBy(totalBalance).multipliedBy(100);

    const marginMaintenance = toBigNum(marginLevel.maintenanceLevel, decimals);
    const marginSearch = toBigNum(marginLevel.searchLevel, decimals);
    const marginInitial = toBigNum(marginLevel.initialLevel, decimals);

    const searchPrice = marginSearch
      .minus(marginAccountBalance)
      .dividedBy(openVolume)
      .plus(markPrice);

    const liquidationPrice = BigNumber.maximum(
      0,
      marginMaintenance
        .minus(marginAccountBalance)
        .minus(generalAccountBalance)
        .dividedBy(openVolume)
        .plus(markPrice)
    );

    const lowMarginLevel =
      marginAccountBalance.isLessThan(
        marginSearch.plus(marginInitial.minus(marginSearch).dividedBy(2))
      ) && generalAccountBalance.isLessThan(marginInitial.minus(marginSearch));

    metrics.push({
      marketName: market.tradableInstrument.instrument.name,
      averageEntryPrice: position.averageEntryPrice,
      marginAccountBalance: marginAccount.balance,
      capitalUtilisation: Math.round(capitalUtilisation.toNumber()),
      currentLeverage: currentLeverage.toNumber(),
      marketDecimalPlaces,
      positionDecimalPlaces,
      decimals,
      assetSymbol:
        market.tradableInstrument.instrument.product.settlementAsset.symbol,
      totalBalance: totalBalance.multipliedBy(10 ** decimals).toFixed(),
      lowMarginLevel,
      liquidationPrice: liquidationPrice
        .multipliedBy(10 ** marketDecimalPlaces)
        .toFixed(0),
      marketId: market.id,
      marketTradingMode: market.tradingMode,
      markPrice: marketData.markPrice,
      notional: notional.multipliedBy(10 ** marketDecimalPlaces).toFixed(0),
      openVolume: position.openVolume,
      realisedPNL: position.realisedPNL,
      unrealisedPNL: position.unrealisedPNL,
      searchPrice: searchPrice
        .multipliedBy(10 ** marketDecimalPlaces)
        .toFixed(0),
      updatedAt: position.updatedAt || null,
    });
  });
  return metrics;
};

export const update = (
  data: PositionsQuery['party'],
  deltas: PositionsSubscriptionSubscription['positions']
) => {
  return produce(data, (draft) => {
    deltas.forEach((delta) => {
      if (!draft?.positionsConnection?.edges || !delta) {
        return;
      }
      const index = draft.positionsConnection.edges.findIndex(
        (edge) => edge.node.market.id === delta.marketId
      );
      if (index !== -1) {
        const currNode = draft.positionsConnection.edges[index].node;
        draft.positionsConnection.edges[index].node = {
          ...currNode,
          realisedPNL: delta.realisedPNL,
          unrealisedPNL: delta.unrealisedPNL,
          openVolume: delta.openVolume,
          averageEntryPrice: delta.averageEntryPrice,
          updatedAt: delta.updatedAt,
        };
      } else {
        draft.positionsConnection.edges.unshift({
          __typename: 'PositionEdge',
          node: {
            ...delta,
            __typename: 'Position',
            market: {
              __typename: 'Market',
              id: delta.marketId,
            },
          },
        });
      }
    });
  });
};

export const positionsDataProvider = makeDataProvider<
  PositionsQuery,
  PositionsQuery['party'],
  PositionsSubscriptionSubscription,
  PositionsSubscriptionSubscription['positions']
>({
  query: PositionsDocument,
  subscriptionQuery: PositionsSubscriptionDocument,
  update,
  getData: (responseData: PositionsQuery) => responseData.party,
  getDelta: (subscriptionData: PositionsSubscriptionSubscription) =>
    subscriptionData.positions,
});

const upgradeMarginsConnection = (
  marketId: string,
  margins: MarginsQuery['party'] | null
) => {
  if (marketId && margins?.marginsConnection?.edges) {
    const index =
      margins.marginsConnection.edges.findIndex(
        (edge) => edge.node.market.id === marketId
      ) ?? -1;
    if (index >= 0) {
      const marginLevel = margins.marginsConnection.edges[index].node;
      return {
        maintenanceLevel: marginLevel.maintenanceLevel,
        searchLevel: marginLevel.searchLevel,
        initialLevel: marginLevel.initialLevel,
      };
    }
  }
  return null;
};

export const rejoinPositionData = (
  positions: PositionsQuery['party'] | null,
  marketsData: MarketMaybeWithData[] | null,
  margins: MarginsQuery['party'] | null
): PositionRejoined[] | null => {
  if (positions?.positionsConnection?.edges && marketsData && margins) {
    return positions.positionsConnection.edges.map(({ node }) => {
      return {
        realisedPNL: node.realisedPNL,
        openVolume: node.openVolume,
        unrealisedPNL: node.unrealisedPNL,
        averageEntryPrice: node.averageEntryPrice,
        updatedAt: node.updatedAt,
        market:
          marketsData?.find((market) => market.id === node.market.id) || null,
        margins: upgradeMarginsConnection(node.market.id, margins),
      };
    });
  }
  return null;
};

export interface PositionsMetricsProviderVariables {
  partyId: string;
}

export const positionsMetricsProvider = makeDerivedDataProvider<
  Position[],
  Position[],
  PositionsMetricsProviderVariables
>(
  [
    positionsDataProvider,
    accountsDataProvider,
    marketsWithDataProvider,
    marginsDataProvider,
  ],
  ([positions, accounts, marketsData, margins], variables) => {
    const positionsData = rejoinPositionData(positions, marketsData, margins);
    if (!variables) {
      return [];
    }
    return sortBy(
      getMetrics(positionsData, accounts as Account[] | null),
      'marketName'
    );
  },
  (data, delta, previousData) =>
    data.filter((row) => {
      const previousRow = previousData?.find(
        (previousRow) => previousRow.marketId === row.marketId
      );
      return !(previousRow && isEqual(previousRow, row));
    })
);
