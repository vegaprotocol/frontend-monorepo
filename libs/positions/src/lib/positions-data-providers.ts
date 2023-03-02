import isEqual from 'lodash/isEqual';
import produce from 'immer';
import BigNumber from 'bignumber.js';
import sortBy from 'lodash/sortBy';
import type { Account } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import {
  toBigNum,
  makeDataProvider,
  makeDerivedDataProvider,
  removePaginationWrapper,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import type {
  MarketMaybeWithData,
  MarketDataQueryVariables,
} from '@vegaprotocol/market-list';
import { marketsWithDataProvider } from '@vegaprotocol/market-list';
import type {
  PositionsQuery,
  PositionFieldsFragment,
  PositionsSubscriptionSubscription,
  MarginFieldsFragment,
  PositionsQueryVariables,
} from './__generated__/Positions';
import {
  PositionsDocument,
  PositionsSubscriptionDocument,
} from './__generated__/Positions';
import { marginsDataProvider } from './margin-data-provider';
import { calculateMargins } from './margin-calculator';
import type { Edge } from '@vegaprotocol/react-helpers';
import { OrderStatus, Side } from '@vegaprotocol/types';
import { marketInfoProvider } from '@vegaprotocol/market-info';
import type { MarketInfoQuery } from '@vegaprotocol/market-info';
import { marketDataProvider } from '@vegaprotocol/market-list';
import type { MarketData } from '@vegaprotocol/market-list';
import { ordersProvider } from '@vegaprotocol/orders';
import type { OrderFieldsFragment } from '@vegaprotocol/orders';

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
  currentLeverage: number | undefined;
  decimals: number;
  marketDecimalPlaces: number;
  positionDecimalPlaces: number;
  totalBalance: string;
  assetSymbol: string;
  liquidationPrice: string | undefined;
  lowMarginLevel: boolean;
  marketId: string;
  marketTradingMode: Schema.MarketTradingMode;
  markPrice: string | undefined;
  notional: string | undefined;
  openVolume: string;
  realisedPNL: string;
  unrealisedPNL: string;
  searchPrice: string | undefined;
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
    if (!marginAccount || !marginLevel || !market) {
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
    const capitalUtilisation = totalBalance.isEqualTo(0)
      ? new BigNumber(0)
      : marginAccountBalance.dividedBy(totalBalance).multipliedBy(100);

    const marginMaintenance = toBigNum(marginLevel.maintenanceLevel, decimals);
    const marginSearch = toBigNum(marginLevel.searchLevel, decimals);
    const marginInitial = toBigNum(marginLevel.initialLevel, decimals);

    const searchPrice = markPrice
      ? marginSearch
          .minus(marginAccountBalance)
          .dividedBy(openVolume)
          .plus(markPrice)
      : undefined;

    const liquidationPrice = markPrice
      ? BigNumber.maximum(
          0,
          marginMaintenance
            .minus(marginAccountBalance)
            .minus(generalAccountBalance)
            .dividedBy(openVolume)
            .plus(markPrice)
        )
      : undefined;

    const lowMarginLevel =
      marginAccountBalance.isLessThan(
        marginSearch.plus(marginInitial.minus(marginSearch).dividedBy(2))
      ) && generalAccountBalance.isLessThan(marginInitial.minus(marginSearch));

    metrics.push({
      marketName: market.tradableInstrument.instrument.name,
      averageEntryPrice: position.averageEntryPrice,
      marginAccountBalance: marginAccount.balance,
      capitalUtilisation: Math.round(capitalUtilisation.toNumber()),
      currentLeverage: currentLeverage ? currentLeverage.toNumber() : undefined,
      marketDecimalPlaces,
      positionDecimalPlaces,
      decimals,
      assetSymbol:
        market.tradableInstrument.instrument.product.settlementAsset.symbol,
      totalBalance: totalBalance.multipliedBy(10 ** decimals).toFixed(),
      lowMarginLevel,
      liquidationPrice: liquidationPrice
        ? liquidationPrice.multipliedBy(10 ** marketDecimalPlaces).toFixed(0)
        : undefined,
      marketId: market.id,
      marketTradingMode: market.tradingMode,
      markPrice: marketData ? marketData.markPrice : undefined,
      notional: notional
        ? notional.multipliedBy(10 ** marketDecimalPlaces).toFixed(0)
        : undefined,
      openVolume: position.openVolume,
      realisedPNL: position.realisedPNL,
      unrealisedPNL: position.unrealisedPNL,
      searchPrice: searchPrice
        ? searchPrice.multipliedBy(10 ** marketDecimalPlaces).toFixed(0)
        : undefined,
      updatedAt: position.updatedAt || null,
    });
  });
  return metrics;
};

export const update = (
  data: PositionFieldsFragment[] | null,
  deltas: PositionsSubscriptionSubscription['positions']
) => {
  return produce(data || [], (draft) => {
    deltas.forEach((delta) => {
      const index = draft.findIndex(
        (node) => node.market.id === delta.marketId
      );
      if (index !== -1) {
        const currNode = draft[index];
        draft[index] = {
          ...currNode,
          realisedPNL: delta.realisedPNL,
          unrealisedPNL: delta.unrealisedPNL,
          openVolume: delta.openVolume,
          averageEntryPrice: delta.averageEntryPrice,
          updatedAt: delta.updatedAt,
        };
      } else {
        draft.unshift({
          ...delta,
          __typename: 'Position',
          market: {
            __typename: 'Market',
            id: delta.marketId,
          },
        });
      }
    });
  });
};

export const positionsDataProvider = makeDataProvider<
  PositionsQuery,
  PositionFieldsFragment[],
  PositionsSubscriptionSubscription,
  PositionsSubscriptionSubscription['positions'],
  PositionsQueryVariables
>({
  query: PositionsDocument,
  subscriptionQuery: PositionsSubscriptionDocument,
  update,
  getData: (responseData: PositionsQuery | null) =>
    removePaginationWrapper(responseData?.party?.positionsConnection?.edges) ||
    [],
  getDelta: (subscriptionData: PositionsSubscriptionSubscription) =>
    subscriptionData.positions,
});

const upgradeMarginsConnection = (
  marketId: string,
  margins: MarginFieldsFragment[] | null
) => {
  if (marketId && margins) {
    const index =
      margins.findIndex((node) => node.market.id === marketId) ?? -1;
    if (index >= 0) {
      const marginLevel = margins[index];
      return {
        maintenanceLevel: marginLevel.maintenanceLevel,
        searchLevel: marginLevel.searchLevel,
        initialLevel: marginLevel.initialLevel,
      };
    }
  }
  return null;
};

export const positionDataProvider = makeDerivedDataProvider<
  PositionFieldsFragment,
  never,
  PositionsQueryVariables & MarketDataQueryVariables
>(
  [
    (callback, client, variables) =>
      positionsDataProvider(callback, client, {
        partyId: variables?.partyId || '',
      }),
  ],
  (data, variables) =>
    (data[0] as PositionFieldsFragment[] | null)?.find(
      (p) => p.market.id === variables?.marketId
    ) || null
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
  marketsData: MarketMaybeWithData[] | null,
  margins: MarginFieldsFragment[] | null
): PositionRejoined[] | null => {
  if (positions && marketsData && margins) {
    return positions.map((node) => {
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

export const positionsMetricsProvider = makeDerivedDataProvider<
  Position[],
  Position[],
  PositionsQueryVariables
>(
  [
    positionsDataProvider,
    accountsDataProvider,
    (callback, client) => marketsWithDataProvider(callback, client, undefined),
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

export const volumeAndMarginProvider = makeDerivedDataProvider<
  {
    buyVolume: string;
    sellVolume: string;
    buyInitialMargin: string;
    sellInitialMargin: string;
  },
  never,
  PositionsQueryVariables & MarketDataQueryVariables
>(
  [
    (callback, client, variables) =>
      ordersProvider(callback, client, {
        ...variables,
        filter: {
          status: [
            OrderStatus.STATUS_ACTIVE,
            OrderStatus.STATUS_PARTIALLY_FILLED,
          ],
        },
      }),
    (callback, client, variables) =>
      marketDataProvider(callback, client, { marketId: variables.marketId }),
    marketInfoProvider,
    openVolumeDataProvider,
  ],
  (data) => {
    const orders = data[0] as (Edge<OrderFieldsFragment> | null)[] | null;
    const marketData = data[1] as MarketData | null;
    const marketInfo = data[2] as MarketInfoQuery['market'];
    let openVolume = (data[3] as string | null) || '0';
    const shortPosition = openVolume?.startsWith('-');
    if (shortPosition) {
      openVolume = openVolume.substring(1);
    }
    let buyVolume = BigInt(shortPosition ? 0 : openVolume);
    let sellVolume = BigInt(shortPosition ? openVolume : 0);
    let buyInitialMargin = BigInt(0);
    let sellInitialMargin = BigInt(0);
    if (marketInfo?.riskFactors && marketData) {
      const {
        positionDecimalPlaces,
        decimalPlaces,
        tradableInstrument,
        riskFactors,
      } = marketInfo;
      const { marginCalculator, instrument } = tradableInstrument;
      const { decimals } = instrument.product.settlementAsset;
      const calculatorParams = {
        positionDecimalPlaces,
        decimalPlaces,
        decimals,
        scalingFactors: marginCalculator?.scalingFactors,
        riskFactors,
      };
      if (openVolume !== '0') {
        const { initialMargin } = calculateMargins({
          side: shortPosition ? Side.SIDE_SELL : Side.SIDE_BUY,
          size: openVolume,
          price: marketData.markPrice,
          ...calculatorParams,
        });
        if (shortPosition) {
          sellInitialMargin += BigInt(initialMargin);
        } else {
          buyInitialMargin += BigInt(initialMargin);
        }
      }
      orders?.forEach((order) => {
        if (!order) {
          return;
        }
        const { side, remaining: size } = order.node;
        const initialMargin = BigInt(
          calculateMargins({
            side,
            size,
            price: marketData.markPrice, //getDerivedPrice(order.node, marketData), same use-initial-margin
            ...calculatorParams,
          }).initialMargin
        );
        if (order.node.side === Side.SIDE_BUY) {
          buyVolume += BigInt(size);
          buyInitialMargin += initialMargin;
        } else {
          sellVolume += BigInt(size);
          sellInitialMargin += initialMargin;
        }
      });
    }
    const r = {
      buyVolume: buyVolume.toString(),
      sellVolume: sellVolume.toString(),
      buyInitialMargin: buyInitialMargin.toString(),
      sellInitialMargin: sellInitialMargin.toString(),
    };
    console.log(r);
    return r;
  }
);
