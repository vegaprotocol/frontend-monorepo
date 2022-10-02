import { gql } from '@apollo/client';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { Account } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import { toBigNum } from '@vegaprotocol/react-helpers';
import type {
  Positions,
  Positions_party,
  Positions_party_positionsConnection_edges,
} from './__generated__/Positions';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';

import type {
  PositionsSubscription,
  PositionsSubscription_positions,
} from './__generated__/PositionsSubscription';

import { AccountType } from '@vegaprotocol/types';
import type { MarketTradingMode } from '@vegaprotocol/types';
import type { MarketWithData } from '@vegaprotocol/market-list';
import { marketsWithDataProvider } from '@vegaprotocol/market-list';
import { marginsDataProvider } from './margin-data-provider';
import type { Margins_party } from './__generated__/Margins';

interface PositionMarginLevel {
  maintenanceLevel: string;
  searchLevel: string;
  initialLevel: string;
}

interface PositionRejoined {
  realisedPNL: string;
  openVolume: string;
  unrealisedPNL: string;
  averageEntryPrice: string;
  updatedAt: string | null;
  market: MarketWithData | null;
  margins: PositionMarginLevel | null;
}

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
  party: Positions_party | null;
  positions: Position[] | null;
}

const POSITION_FIELDS = gql`
  fragment PositionFields on Position {
    realisedPNL
    openVolume
    unrealisedPNL
    averageEntryPrice
    updatedAt
    market {
      id
    }
  }
`;

export const POSITIONS_QUERY = gql`
  ${POSITION_FIELDS}
  query Positions($partyId: ID!) {
    party(id: $partyId) {
      id
      positionsConnection {
        edges {
          node {
            ...PositionFields
          }
        }
      }
    }
  }
`;

export const POSITIONS_SUBSCRIPTION = gql`
  subscription PositionsSubscription($partyId: ID!) {
    positions(partyId: $partyId) {
      realisedPNL
      openVolume
      unrealisedPNL
      averageEntryPrice
      updatedAt
      marketId
    }
  }
`;

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
    if (
      !marginAccount ||
      !marginLevel ||
      !market ||
      !marketData ||
      position.openVolume === '0'
    ) {
      return;
    }
    const generalAccount = accounts?.find(
      (account) =>
        account.asset.id === marginAccount.asset.id &&
        account.type === AccountType.ACCOUNT_TYPE_GENERAL
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
      averageEntryPrice: position.averageEntryPrice,
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
      updatedAt: position.updatedAt,
    });
  });
  return metrics;
};

export const update = (
  data: Positions_party,
  deltas: PositionsSubscription_positions[]
) => {
  return produce(data, (draft) => {
    deltas.forEach((delta) => {
      if (!draft.positionsConnection?.edges || !delta) {
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
  Positions,
  Positions_party,
  PositionsSubscription,
  PositionsSubscription_positions[]
>({
  query: POSITIONS_QUERY,
  subscriptionQuery: POSITIONS_SUBSCRIPTION,
  update,
  getData: (responseData: Positions) => responseData.party,
  getDelta: (subscriptionData: PositionsSubscription) =>
    subscriptionData.positions,
});

const upgradeMarginsConection = (
  marketId: string,
  margins: Margins_party | null
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
  positions: Positions_party | null,
  marketsData: MarketWithData[] | null,
  margins: Margins_party | null
): PositionRejoined[] | null => {
  if (positions?.positionsConnection?.edges && marketsData && margins) {
    return positions.positionsConnection.edges.map(
      (nodes: Positions_party_positionsConnection_edges) => {
        return {
          realisedPNL: nodes.node.realisedPNL,
          openVolume: nodes.node.openVolume,
          unrealisedPNL: nodes.node.unrealisedPNL,
          averageEntryPrice: nodes.node.averageEntryPrice,
          updatedAt: nodes.node.updatedAt,
          market:
            marketsData?.find((market) => market.id === nodes.node.market.id) ||
            null,
          margins: upgradeMarginsConection(nodes.node.market.id, margins),
        };
      }
    );
  }
  return null;
};

export const positionsMetricsDataProvider = makeDerivedDataProvider<
  Position[],
  never
>(
  [
    positionsDataProvider,
    accountsDataProvider,
    marketsWithDataProvider,
    marginsDataProvider,
  ],
  ([positions, accounts, marketsData, margins]) => {
    const positionsData = rejoinPositionData(positions, marketsData, margins);
    return sortBy(
      getMetrics(positionsData, accounts as Account[] | null),
      'updatedAt'
    ).reverse();
  }
);
