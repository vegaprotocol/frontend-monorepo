import { gql } from '@apollo/client';
import produce from 'immer';
import type {
  PositionsMetrics,
  PositionsMetrics_party,
} from './__generated__/PositionsMetrics';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

import type {
  PositionsMetricsSubsciption,
  PositionsMetricsSubsciption_positions,
} from './__generated__/PositionsMetricsSubsciption';

import { AccountType } from '@vegaprotocol/types';
import type { MarketTradingMode } from '@vegaprotocol/types';

export interface Position {
  marketName: string;
  averageEntryPrice: string;
  capitalUtilisation: string;
  currentLeverage: string;
  decimalPlaces: number;
  generalAccountBalance: string;
  totalBalance: string;
  instrumentName: string;
  // leverageInitial: string;
  // leverageMaintenance: string;
  // leverageRelease: string;
  // leverageSearch: string;
  liquidationPrice: string;
  marginAccountBalance: string;
  marginMaintenance: string;
  marginSearch: string;
  marketId: string;
  marketTradingMode: MarketTradingMode;
  markPrice: string;
  notional: string;
  openVolume: string;
  realisedPNL: string;
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
      accounts {
        balance
        market {
          id
        }
        asset {
          id
          decimals
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
      accounts(type: General) {
        type
        asset {
          id
        }
        balance
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
  subscription PositionsMetricsSubsciption($partyId: ID!) {
    positions(partyId: $partyId) {
      ...PositionMetricsFields
    }
  }
`;

/*
const alphanumericComparator = (a: string, b: string, isInverted: boolean) => {
  if (a < b) {
    return isInverted ? 1 : -1;
  }

  if (a > b) {
    return isInverted ? -1 : 1;
  }

  return 0;
};

const comparator = (
  valueA: string,
  valueB: string,
  nodeA: { data: Positions_party_positions },
  nodeB: { data: Positions_party_positions },
  isInverted: boolean
) =>
  alphanumericComparator(
    nodeA.data.market.tradableInstrument.instrument.name,
    nodeB.data.market.tradableInstrument.instrument.name,
    isInverted
  ) ||
  alphanumericComparator(
    nodeA.data.market.id,
    nodeB.data.market.id,
    isInverted
  );
*/

const getMetrics = (data: PositionsMetrics_party | null) => {
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
    const marginAccount = market.accounts?.find(
      (account) => account.market?.id === market.id
    );
    if (!marginAccount || !marginLevel || !marketData) {
      return;
    }
    const generalAccount = data.accounts?.find(
      (account) =>
        account.asset.id === marginAccount.asset.id &&
        account.type === AccountType.General
    );
    const assetDecimalPlaces = marginAccount.asset.decimals;
    const marketDecimalPlaces = market.decimalPlaces;
    const { positionDecimalPlaces } = market;
    const decimalPlaces = Math.max(
      marginAccount.asset.decimals,
      market.decimalPlaces,
      market.positionDecimalPlaces
    );
    const assetDecimalPlacesCorrection = BigInt(
      10 ** (decimalPlaces - assetDecimalPlaces)
    );
    const marketDecimalPlacesCorrection = BigInt(
      10 ** (decimalPlaces - marketDecimalPlaces)
    );
    const positionDecimalPlacesCorrection = BigInt(
      10 ** (decimalPlaces - positionDecimalPlaces)
    );
    const openVolume =
      BigInt(position.node.openVolume) * positionDecimalPlacesCorrection;
    const averageEntryPrice =
      BigInt(position.node.averageEntryPrice) * marketDecimalPlacesCorrection;

    const realisedPNL =
      BigInt(position.node.realisedPNL) * marketDecimalPlacesCorrection;

    const marginAccountBalance = marginAccount
      ? BigInt(marginAccount.balance) * assetDecimalPlacesCorrection
      : BigInt(0);
    const generalAccountBalance = generalAccount
      ? BigInt(generalAccount.balance) * assetDecimalPlacesCorrection
      : BigInt(0);

    const markPrice =
      BigInt(marketData.markPrice) * marketDecimalPlacesCorrection;

    const notional =
      (openVolume > 0 ? openVolume : openVolume * BigInt(-1)) * markPrice;
    const totalBalance = marginAccountBalance + generalAccountBalance;
    const currentLeverage = notional / totalBalance;
    const capitalUtilisation =
      (BigInt(100) * marginAccountBalance) / totalBalance;

    const marginMaintenance =
      BigInt(marginLevel.maintenanceLevel) * marketDecimalPlacesCorrection;
    const marginSearch =
      BigInt(marginLevel.searchLevel) * marketDecimalPlacesCorrection;
    /*
    const marginInitial =
      BigInt(marginLevel.initialLevel) * marketDecimalPlacesCorrection;
    const marginRelease =
      BigInt(marginLevel.collateralReleaseLevel) *
      marketDecimalPlacesCorrection;
    */

    const searchPrice =
      (marginSearch - marginAccountBalance) / openVolume + markPrice;
    const liquidationPrice =
      (marginMaintenance - marginAccountBalance - generalAccountBalance) /
        openVolume +
      markPrice;

    metrics.push({
      marketName: market.name,
      averageEntryPrice: averageEntryPrice.toString(),
      capitalUtilisation: capitalUtilisation.toString(),
      currentLeverage: currentLeverage.toString(),
      decimalPlaces,
      generalAccountBalance: generalAccountBalance.toString(),
      instrumentName: position.node.market.tradableInstrument.instrument.name,
      totalBalance: totalBalance.toString(),
      // leverageInitial: notional / marginInitial,
      // leverageMaintenance: notional / marginMaintenance,
      // leverageRelease: notional / marginRelease,
      // leverageSearch: notional / marginSearch,
      liquidationPrice: liquidationPrice.toString(),
      marginAccountBalance: marginAccountBalance.toString(),
      marginMaintenance: marginMaintenance.toString(),
      marginSearch: marginSearch.toString(),
      marketId: position.node.market.id,
      marketTradingMode: position.node.market.tradingMode,
      markPrice: markPrice.toString(),
      notional: notional.toString(),
      openVolume: openVolume.toString(),
      realisedPNL: realisedPNL.toString(),
      searchPrice: searchPrice.toString(),
      updatedAt: position.node.updatedAt,
    });
  });
  return metrics;
};

const update = (data: Data, delta: PositionsMetricsSubsciption_positions) => {
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
    positions: getMetrics(responseData.party)?.sort(),
  };
};

const getDelta = (
  subscriptionData: PositionsMetricsSubsciption
): PositionsMetricsSubsciption_positions => subscriptionData.positions;

export const positionsMetricsDataProvider = makeDataProvider<
  PositionsMetrics,
  Data,
  PositionsMetricsSubsciption,
  PositionsMetricsSubsciption_positions
>(
  POSITION_METRICS_QUERY,
  POSITIONS_METRICS_SUBSCRIPTION,
  update,
  getData,
  getDelta
);
