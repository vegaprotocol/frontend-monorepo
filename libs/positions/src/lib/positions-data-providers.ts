import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { AccountFieldsFragment } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { PositionsDocument, PositionsEventDocument } from './__generated__/Positions';
import type {
  PositionsQuery,
  PositionsEventSubscription,
} from './__generated__/Positions';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';

import { Schema } from '@vegaprotocol/types';
import type { MarketTradingMode } from '@vegaprotocol/types';

export interface Position {
  marketName: string;
  averageEntryPrice: string;
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
  marketTradingMode: MarketTradingMode;
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
  data: PositionsQuery['party'] | null,
  accounts: AccountFieldsFragment[] | null
): Position[] => {
  if (!data || !data?.positionsConnection.edges) {
    return [];
  }
  const metrics: Position[] = [];
  data?.positionsConnection.edges.forEach((position) => {
    const market = position.node.market;
    const marketData = market.data;
    const marginLevel = position.node.marginsConnection.edges?.find(
      (margin) => margin.node.market.id === market.id
    )?.node;
    const marginAccount = accounts?.find((account) => {
      return account.market?.id === market.id;
    });
    if (
      !marginAccount ||
      !marginLevel ||
      !marketData ||
      position.node.openVolume === '0'
    ) {
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
    const openVolume = toBigNum(
      position.node.openVolume,
      positionDecimalPlaces
    );

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

    const marginMaintenance = toBigNum(
      marginLevel.maintenanceLevel,
      marketDecimalPlaces
    );
    const marginSearch = toBigNum(marginLevel.searchLevel, marketDecimalPlaces);
    const marginInitial = toBigNum(
      marginLevel.initialLevel,
      marketDecimalPlaces
    );

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
      averageEntryPrice: position.node.averageEntryPrice,
      capitalUtilisation: Math.round(capitalUtilisation.toNumber()),
      currentLeverage: currentLeverage.toNumber(),
      marketDecimalPlaces,
      positionDecimalPlaces,
      decimals,
      assetSymbol: marginLevel.asset.symbol,
      totalBalance: totalBalance.multipliedBy(10 ** decimals).toFixed(),
      lowMarginLevel,
      liquidationPrice: liquidationPrice
        .multipliedBy(10 ** marketDecimalPlaces)
        .toFixed(0),
      marketId: position.node.market.id,
      marketTradingMode: position.node.market.tradingMode,
      markPrice: marketData.markPrice,
      notional: notional.multipliedBy(10 ** marketDecimalPlaces).toFixed(0),
      openVolume: position.node.openVolume,
      realisedPNL: position.node.realisedPNL,
      unrealisedPNL: position.node.unrealisedPNL,
      searchPrice: searchPrice
        .multipliedBy(10 ** marketDecimalPlaces)
        .toFixed(0),
      updatedAt: position.node.updatedAt ?? null,
    });
  });
  return metrics;
};

export const update = (
  data: PositionsQuery['party'],
  delta: PositionsEventSubscription['positions'] | null
) => {
  return produce(data, (draft) => {
    if (!draft?.positionsConnection.edges || !delta) {
      return;
    }
    const index = draft.positionsConnection.edges.findIndex(
      (edge) => edge.node.market.id === delta.market.id
    );
    if (index !== -1) {
      draft.positionsConnection.edges[index].node = delta;
    } else {
      draft.positionsConnection.edges.push({
        __typename: 'PositionEdge',
        node: delta,
      });
    }
  });
};

export const positionDataProvider = makeDataProvider<
  PositionsQuery,
  PositionsQuery['party'],
  PositionsEventSubscription,
  PositionsEventSubscription['positions']
>({
  query: PositionsDocument,
  subscriptionQuery: PositionsEventDocument,
  update,
  getData: (responseData: PositionsQuery) => responseData.party,
  getDelta: (subscriptionData: PositionsEventSubscription) =>
    subscriptionData.positions,
});

export const positionsMetricsDataProvider = makeDerivedDataProvider<Position[]>(
  [positionDataProvider, accountsDataProvider],
  ([positions, accounts]) => {
    return sortBy(
      getMetrics(
        positions as PositionsQuery['party'] | null,
        accounts as AccountFieldsFragment[] | null
      ),
      'updatedAt'
    ).reverse();
  }
);
