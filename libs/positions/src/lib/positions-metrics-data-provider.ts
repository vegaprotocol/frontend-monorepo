import { gql } from '@apollo/client';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type {
  PositionsMetrics,
  PositionsMetrics_party,
} from './__generated__/PositionsMetrics';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

import type {
  PositionsMetricsSubscription,
  PositionsMetricsSubscription_positions,
} from './__generated__/PositionsMetricsSubscription';

import { AccountType, MarketTradingModeMapping } from '@vegaprotocol/types';

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
  marketTradingMode: MarketTradingModeMapping;
  markPrice: string;
  notional: string;
  openVolume: string;
  realisedPNL: string;
  unrealisedPNL: string;
  searchPrice: string;
  updatedAt: string | null;
}

export interface Data {
  party: PositionsMetrics_party | null;
  positions: Position[] | null;
}

const POSITIONS_METRICS_FRAGMENT = gql`
  fragment PositionMetricsFields on Position {
    realisedPNL
    openVolume
    unrealisedPNL
    averageEntryPrice
    updatedAt
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

const POSITION_METRICS_QUERY = gql`
  ${POSITIONS_METRICS_FRAGMENT}
  query PositionsMetrics($partyId: ID!) {
    party(id: $partyId) {
      id
      accounts {
        type
        asset {
          id
          decimals
        }
        balance
        market {
          id
        }
      }
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
      positionsConnection {
        edges {
          node {
            ...PositionMetricsFields
          }
        }
      }
    }
  }
`;

export const POSITIONS_METRICS_SUBSCRIPTION = gql`
  ${POSITIONS_METRICS_FRAGMENT}
  subscription PositionsMetricsSubscription($partyId: ID!) {
    positions(partyId: $partyId) {
      ...PositionMetricsFields
    }
  }
`;

export const getMetrics = (data: PositionsMetrics_party | null): Position[] => {
  if (!data || !data.positionsConnection.edges) {
    return [];
  }
  const metrics: Position[] = [];
  data.positionsConnection.edges.forEach((position) => {
    const market = position.node.market;
    const marketData = market.data;
    const marginLevel = data.marginsConnection.edges?.find(
      (margin) => margin.node.market.id === market.id
    )?.node;
    const marginAccount = data.accounts?.find(
      (account) => account.market?.id === market.id
    );
    if (!marginAccount || !marginLevel || !marketData) {
      return;
    }
    const generalAccount = data.accounts?.find(
      (account) =>
        account.asset.id === marginAccount.asset.id &&
        account.type === AccountType.ACCOUNT_TYPE_GENERAL
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
      marketTradingMode:
        MarketTradingModeMapping[position.node.market.tradingMode],
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
  data: Data,
  delta: PositionsMetricsSubscription_positions
) => {
  if (!data.party?.positionsConnection.edges) {
    return data;
  }
  const edges = produce(data.party.positionsConnection.edges, (draft) => {
    const index = draft.findIndex(
      (edge) => edge.node.market.id === delta.market.id
    );
    if (index !== -1) {
      draft[index].node = delta;
    } else {
      draft.push({ __typename: 'PositionEdge', node: delta });
    }
  });
  const party = produce(data.party, (draft) => {
    draft.positionsConnection.edges = edges;
  });
  if (party === data.party) {
    return data;
  }
  return {
    party,
    positions: getMetrics(party),
  };
};

const getData = (responseData: PositionsMetrics): Data => {
  return {
    party: responseData.party,
    positions: sortBy(getMetrics(responseData.party), 'updatedAt').reverse(),
  };
};

const getDelta = (
  subscriptionData: PositionsMetricsSubscription
): PositionsMetricsSubscription_positions => subscriptionData.positions;

export const positionsMetricsDataProvider = makeDataProvider<
  PositionsMetrics,
  Data,
  PositionsMetricsSubscription,
  PositionsMetricsSubscription_positions
>(
  POSITION_METRICS_QUERY,
  POSITIONS_METRICS_SUBSCRIPTION,
  update,
  getData,
  getDelta
);
