import { gql } from '@apollo/client';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { Accounts_party_accounts } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import { toBigNum } from '@vegaprotocol/react-helpers';
import type { Positions, Positions_party } from './__generated__/Positions';
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
        market {
          id
        }
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
  data: Positions_party | null,
  accounts: Accounts_party_accounts[] | null
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
    if (!marginAccount || !marginLevel || !marketData) {
      return;
    }
    const generalAccount = accounts?.find(
      (account) =>
        account.asset.id === marginAccount.asset.id &&
        account.type === AccountType.General
    );
    const assetDecimals = marginAccount.asset.decimals;
    const { positionDecimalPlaces, decimalPlaces: marketDecimalPlaces } =
      market;
    const openVolume = toBigNum(
      position.node.openVolume,
      positionDecimalPlaces
    );

    const marginAccountBalance = toBigNum(
      marginAccount.balance ?? 0,
      assetDecimals
    );
    const generalAccountBalance = toBigNum(
      generalAccount?.balance ?? 0,
      assetDecimals
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
  delta: PositionsSubscription_positions | null
) => {
  return produce(data, (draft) => {
    if (!draft.positionsConnection.edges || !delta) {
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

export const positionsMetricsDataProvider = makeDerivedDataProvider<Position[]>(
  [positionDataProvider, accountsDataProvider],
  ([positions, accounts]) => {
    return sortBy(
      getMetrics(
        positions as Positions_party | null,
        accounts as Accounts_party_accounts[] | null
      ),
      'updatedAt'
    ).reverse();
  }
);
