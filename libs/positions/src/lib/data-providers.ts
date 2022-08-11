import { gql } from '@apollo/client';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { Accounts } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import type { Positions, Positions_party } from './__generated__/Positions';
import {
  makeDataProvider,
  makeDependencyDataProvider,
} from '@vegaprotocol/react-helpers';

import type {
  PositionsSubscription,
  PositionsSubscription_positions,
} from './__generated__/PositionsSubscription';

import { AccountType } from '@vegaprotocol/types';
import type { MarketTradingMode } from '@vegaprotocol/types';

export interface Position {
  marketName: string;
  averageEntryPrice: string;
  capitalUtilisation: number;
  currentLeverage: number;
  assetDecimals: number;
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
    marginsConnection {
      edges {
        node {
          market {
            id
          }
          maintenanceLevel
          searchLevel
          initialLevel
          collateralReleaseLevel
          asset {
            symbol
          }
        }
      }
    }
    market {
      id
      name
      decimalPlaces
      positionDecimalPlaces
      tradingMode
      tradableInstrument {
        instrument {
          name
        }
      }
      data {
        markPrice
      }
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
  ${POSITION_FIELDS}
  subscription PositionsSubscription($partyId: ID!) {
    positions(partyId: $partyId) {
      ...PositionFields
    }
  }
`;

export const getMetrics = (
  data: Positions | null,
  accounts: Accounts | null
): Position[] => {
  if (!data || !data.party?.positionsConnection.edges) {
    return [];
  }
  const metrics: Position[] = [];
  data.party?.positionsConnection.edges.forEach((position) => {
    const market = position.node.market;
    const marketData = market.data;
    const marginLevel = position.node.marginsConnection.edges?.find(
      (margin) => margin.node.market.id === market.id
    )?.node;
    const marginAccount = accounts?.party?.accounts?.find(
      (account) => account.market?.id === market.id
    );
    if (!marginAccount || !marginLevel || !marketData) {
      return;
    }
    const generalAccount = accounts?.party?.accounts?.find(
      (account) =>
        account.asset.id === marginAccount.asset.id &&
        account.type === AccountType.General
    );
    const assetDecimals = marginAccount.asset.decimals;
    const { positionDecimalPlaces, decimalPlaces: marketDecimalPlaces } =
      market;
    const openVolume = new BigNumber(position.node.openVolume).dividedBy(
      10 ** positionDecimalPlaces
    );

    const marginAccountBalance = marginAccount
      ? new BigNumber(marginAccount.balance).dividedBy(10 ** assetDecimals)
      : new BigNumber(0);
    const generalAccountBalance = generalAccount
      ? new BigNumber(generalAccount.balance).dividedBy(10 ** assetDecimals)
      : new BigNumber(0);

    const markPrice = new BigNumber(marketData.markPrice).dividedBy(
      10 ** marketDecimalPlaces
    );

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

    const marginMaintenance = new BigNumber(
      marginLevel.maintenanceLevel
    ).multipliedBy(marketDecimalPlaces);
    const marginSearch = new BigNumber(marginLevel.searchLevel).multipliedBy(
      marketDecimalPlaces
    );
    const marginInitial = new BigNumber(marginLevel.initialLevel).multipliedBy(
      marketDecimalPlaces
    );

    const searchPrice = openVolume.isEqualTo(0)
      ? markPrice
      : marginSearch
          .minus(marginAccountBalance)
          .dividedBy(openVolume)
          .plus(markPrice);
    const liquidationPrice = openVolume.isEqualTo(0)
      ? markPrice
      : marginMaintenance
          .minus(marginAccountBalance)
          .minus(generalAccountBalance)
          .dividedBy(openVolume)
          .plus(markPrice);

    const lowMarginLevel =
      marginAccountBalance.isLessThan(
        marginSearch.plus(marginInitial.minus(marginSearch).dividedBy(2))
      ) && generalAccountBalance.isLessThan(marginInitial.minus(marginSearch));

    metrics.push({
      marketName: market.name,
      averageEntryPrice: position.node.averageEntryPrice,
      capitalUtilisation: Math.round(capitalUtilisation.toNumber()),
      currentLeverage: currentLeverage.toNumber(),
      marketDecimalPlaces,
      positionDecimalPlaces,
      assetDecimals,
      assetSymbol: marginLevel.asset.symbol,
      totalBalance: totalBalance.multipliedBy(10 ** assetDecimals).toFixed(),
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
      updatedAt: position.node.updatedAt,
    });
  });
  return metrics;
};

export const update = (
  data: Positions_party,
  delta: PositionsSubscription_positions
) => {
  return produce(data, (draft) => {
    if (!draft.positionsConnection.edges) {
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
  Positions,
  Positions_party,
  PositionsSubscription,
  PositionsSubscription_positions
>({
  query: POSITIONS_QUERY,
  subscriptionQuery: POSITIONS_SUBSCRIPTION,
  update,
  getData: (responseData: Positions) => responseData.party,
  getDelta: (subscriptionData: PositionsSubscription) =>
    subscriptionData.positions,
});

export const positionsMetricsDataProvider = makeDependencyDataProvider<
  Position[]
>([positionDataProvider, accountsDataProvider], ([positions, accounts]) => {
  return sortBy(
    getMetrics(positions as Positions | null, accounts as Accounts | null),
    'updatedAt'
  ).reverse();
});
