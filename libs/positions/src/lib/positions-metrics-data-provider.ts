import { gql } from '@apollo/client';
import produce from 'immer';
import BigNumber from 'bignumber.js';
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
  capitalUtilisation: number;
  currentLeverage: number;
  assetDecimals: number;
  marketDecimalPlaces: number;
  positionDecimalPlaces: number;
  // generalAccountBalance: string;
  totalBalance: string;
  assetSymbol: string;
  // leverageInitial: string;
  // leverageMaintenance: string;
  // leverageRelease: string;
  // leverageSearch: string;
  liquidationPrice: string;
  lowMarginLevel: boolean;
  // marginAccountBalance: string;
  // marginMaintenance: string;
  // marginSearch: string;
  // marginInitial: string;
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

export const getMetrics = (data: PositionsMetrics_party | null) => {
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
    const currentLeverage = notional.dividedBy(totalBalance);
    const capitalUtilisation = marginAccountBalance
      .dividedBy(totalBalance)
      .multipliedBy(100);

    const marginMaintenance = new BigNumber(
      marginLevel.maintenanceLevel
    ).multipliedBy(marketDecimalPlaces);
    const marginSearch = new BigNumber(marginLevel.searchLevel).multipliedBy(
      marketDecimalPlaces
    );
    const marginInitial = new BigNumber(marginLevel.initialLevel).multipliedBy(
      marketDecimalPlaces
    );
    /*
    const marginRelease =  = new BigNumber(marginLevel.collateralReleaseLevel).multipliedBy(
      marketDecimalPlaces
    );
    */

    const searchPrice = marginSearch
      .minus(marginAccountBalance)
      .dividedBy(openVolume)
      .plus(markPrice);
    const liquidationPrice = marginMaintenance
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
      // generalAccountBalance: generalAccount?.balance ?? '0',
      assetSymbol: marginLevel.asset.symbol,
      totalBalance: totalBalance.multipliedBy(10 ** assetDecimals).toFixed(),
      lowMarginLevel,
      // leverageInitial: notional / marginInitial,
      // leverageMaintenance: notional / marginMaintenance,
      // leverageRelease: notional / marginRelease,
      // leverageSearch: notional / marginSearch,
      liquidationPrice: liquidationPrice
        .multipliedBy(10 ** marketDecimalPlaces)
        .toFixed(0),
      // marginAccountBalance: marginAccount.balance,
      // marginMaintenance: marginMaintenance.toString(),
      // marginSearch: marginSearch.multipliedBy(10 ** assetDecimals).toFixed(),
      // marginInitial: marginInitial.multipliedBy(10 ** assetDecimals).toFixed(),
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
  data: Data,
  delta: PositionsMetricsSubsciption_positions
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
    positions: getMetrics(responseData.party)?.sort(), //#TODO sort by updated at desc here on in table
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
