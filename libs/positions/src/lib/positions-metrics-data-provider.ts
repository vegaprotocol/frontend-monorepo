import { gql } from '@apollo/client';
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

const significantDigits = 4;
const round = (value: number) => {
  const digits =
    significantDigits - Math.floor(Math.log10(Math.abs(value))) - 1;
  return Math.round(value * digits) / digits;
};

interface PositionMetrics {
  markPrice: BigInt;
  openVolume: number;
  marginAccountBalance: number;
  generalAccountBalance: number;
  capitalUtilisation: number;
  currentLeverage: number;
  // riskFactor: number;
  leverageMaintenance: number;
  leverageSearch: number;
  leverageInitial: number;
  leverageRelease: number;
  marginSearch: number;
  marginMaintenance: number;
  searchPrice: BigInt;
  liquidationPrice: BigInt;
}

interface Data {
  party: PositionsMetrics_party | null;
  metrics: PositionMetrics[] | null;
}

const POSITIONS_METRICS_FRAGMENT = gql`
  fragment PositionMetricsFields on Position {
    openVolume
    market {
      id
      decimalPlaces
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
      #tradableInstrument {
      #  instrument {
      #    name
      #  }
      #  marginCalculator {
      #    scalingFactors {
      #      searchLevel
      #    }
      #  }
      #  riskModel {
      #    ... on LogNormalRiskModel {
      #      tau
      #      params {
      #        mu
      #        r
      #        sigma
      #      }
      #    }
      #  }
      #}
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

const getMetrics = (data: PositionsMetrics_party | null) => {
  if (!data || !data.positionsConnection.edges) {
    return null;
  }
  const metrics: PositionMetrics[] = [];
  data.positionsConnection.edges.forEach((position) => {
    const openVolume = Number(position.node.openVolume);
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

    const marginAccountBalance = marginAccount
      ? Number(marginAccount.balance) * 10 ** -assetDecimalPlaces
      : 0;
    const generalAccountBalance = generalAccount
      ? Number(generalAccount.balance) * 10 ** -assetDecimalPlaces
      : 0;

    const notional =
      Math.abs(openVolume) *
      Number(marketData.markPrice) *
      10 ** -marketDecimalPlaces;
    const currentLeverage = round(
      notional / (generalAccountBalance + marginAccountBalance)
    );
    const capitalUtilisation = round(
      (marginAccountBalance / (marginAccountBalance + generalAccountBalance)) *
        100
    );

    const marginMaintenance =
      Number(marginLevel.maintenanceLevel) * 10 ** -marketDecimalPlaces;
    const marginSearch =
      Number(marginLevel.searchLevel) * 10 ** -marketDecimalPlaces;
    const marginInitial =
      Number(marginLevel.initialLevel) * 10 ** -marketDecimalPlaces;
    const marginRelease =
      Number(marginLevel.collateralReleaseLevel) * 10 ** -marketDecimalPlaces;

    const markPrice = BigInt(marketData.markPrice);

    const searchPrice =
      BigInt((marginSearch - marginAccountBalance) / openVolume) + markPrice;
    const liquidationPrice =
      BigInt(
        (marginMaintenance - marginAccountBalance - generalAccountBalance) /
          openVolume
      ) + markPrice;

    metrics.push({
      markPrice,
      openVolume,
      marginAccountBalance,
      generalAccountBalance,
      capitalUtilisation,
      currentLeverage,
      leverageMaintenance: round(notional / marginMaintenance),
      leverageSearch: round(notional / marginSearch),
      leverageInitial: round(notional / marginInitial),
      leverageRelease: round(notional / marginRelease),
      marginSearch,
      marginMaintenance,
      searchPrice,
      liquidationPrice,
    });
  });
  return metrics;
};

const update = (data: Data, delta: PositionsMetricsSubsciption_positions) => {
  return data;
};

const getData = (responseData: PositionsMetrics): Data => {
  return {
    party: responseData.party,
    metrics: getMetrics(responseData.party),
  };
};

const getDelta = (
  subscriptionData: PositionsMetricsSubsciption
): PositionsMetricsSubsciption_positions => subscriptionData.positions;

export const positionsDataProvider = makeDataProvider<
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
