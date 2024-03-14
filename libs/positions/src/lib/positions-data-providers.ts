import isEqual from 'lodash/isEqual';
import produce from 'immer';
import sortBy from 'lodash/sortBy';
import {
  marginsDataProvider,
  type Account,
  type MarginFieldsFragment,
  marketMarginDataProvider,
} from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import { toBigNum, removePaginationWrapper } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import {
  type MarketMaybeWithData,
  type MarketDataQueryVariables,
  allMarketsWithLiveDataProvider,
  getAsset,
  marketInfoProvider,
  type MarketInfo,
} from '@vegaprotocol/markets';
import {
  PositionsDocument,
  PositionsSubscriptionDocument,
  type PositionsQuery,
  type PositionFieldsFragment,
  type PositionsSubscriptionSubscription,
  type PositionsQueryVariables,
  type PositionsSubscriptionSubscriptionVariables,
} from './__generated__/Positions';
import {
  AccountType,
  MarginMode,
  MarketState,
  type MarketTradingMode,
  type PositionStatus,
  type ProductType,
} from '@vegaprotocol/types';

export interface Position {
  marginMode: MarginFieldsFragment['marginMode'];
  marginFactor: MarginFieldsFragment['marginFactor'];
  maintenanceLevel: MarginFieldsFragment['maintenanceLevel'] | undefined;
  assetId: string;
  assetSymbol: string;
  averageEntryPrice: string;
  currentLeverage: number | undefined;
  assetDecimals: number;
  quantum: string;
  lossSocializationAmount: string;
  marginAccountBalance: string;
  orderMarginAccountBalance: string;
  generalAccountBalance: string;
  marketDecimalPlaces: number;
  marketId: string;
  marketCode: string;
  marketTradingMode: MarketTradingMode;
  marketState: MarketState;
  markPrice: string | undefined;
  notional: string | undefined;
  openVolume: string;
  partyId: string;
  positionDecimalPlaces: number;
  realisedPNL: string;
  status: PositionStatus;
  totalBalance: string;
  totalMarginAccountBalance: string;
  unrealisedPNL: string;
  updatedAt: string | null;
  productType: ProductType;
}

export const getMetrics = (
  data: ReturnType<typeof rejoinPositionData> | null,
  accounts: Account[] | null,
  margins: MarginFieldsFragment[] | null
): Position[] => {
  if (!data || !data?.length) {
    return [];
  }

  const metrics: Position[] = [];
  data.forEach((position) => {
    const market = position.market;
    if (!market) {
      return;
    }

    const marketData = market?.data;
    const margin = margins?.find((margin) => {
      return margin.market?.id === market?.id;
    });
    const marginAccount = accounts?.find((account) => {
      return (
        account.market?.id === market?.id &&
        account.type === AccountType.ACCOUNT_TYPE_MARGIN
      );
    });
    const orderAccount = accounts?.find((account) => {
      return (
        account.market?.id === market?.id &&
        account.type === AccountType.ACCOUNT_TYPE_ORDER_MARGIN
      );
    });
    const asset = getAsset(market);
    const generalAccount = accounts?.find(
      (account) =>
        account.asset.id === asset.id &&
        account.type === AccountType.ACCOUNT_TYPE_GENERAL
    );

    const { positionDecimalPlaces, decimalPlaces: marketDecimalPlaces } =
      market;
    const openVolume = toBigNum(position.openVolume, positionDecimalPlaces);

    const marginAccountBalance = toBigNum(
      marginAccount?.balance ?? 0,
      asset.decimals
    );
    const orderMarginAccountBalance = toBigNum(
      orderAccount?.balance ?? 0,
      asset.decimals
    );
    const generalAccountBalance = toBigNum(
      generalAccount?.balance ?? 0,
      asset.decimals
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
    const totalMarginAccountBalance = marginAccountBalance.plus(
      orderMarginAccountBalance
    );
    const totalBalance = totalMarginAccountBalance.plus(generalAccountBalance);

    const marginMode =
      margin?.marginMode || MarginMode.MARGIN_MODE_CROSS_MARGIN;
    const marginFactor = margin?.marginFactor || '1';
    const currentLeverage =
      marginMode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN
        ? (marginFactor && 1 / Number(marginFactor)) || undefined
        : notional
        ? totalBalance.isEqualTo(0)
          ? 0
          : notional.dividedBy(totalBalance).toNumber()
        : undefined;
    metrics.push({
      marginMode,
      marginFactor,
      maintenanceLevel: margin?.maintenanceLevel,
      assetId: asset.id,
      assetSymbol: asset.symbol,
      averageEntryPrice: position.averageEntryPrice,
      currentLeverage,
      assetDecimals: asset.decimals,
      quantum: asset.quantum,
      lossSocializationAmount: position.lossSocializationAmount || '0',
      marginAccountBalance: marginAccount?.balance ?? '0',
      orderMarginAccountBalance: orderAccount?.balance ?? '0',
      generalAccountBalance: generalAccount?.balance ?? '0',
      marketDecimalPlaces,
      marketId: market.id,
      marketCode: market.tradableInstrument.instrument.code,
      marketTradingMode: market.tradingMode,
      marketState: market.state,
      markPrice: marketData ? marketData.markPrice : undefined,
      notional: notional
        ? notional.multipliedBy(10 ** marketDecimalPlaces).toFixed(0)
        : undefined,
      openVolume: position.openVolume,
      partyId: position.party.id,
      positionDecimalPlaces,
      realisedPNL: position.realisedPNL,
      status: position.positionStatus,
      totalBalance: totalBalance.multipliedBy(10 ** asset.decimals).toFixed(),
      totalMarginAccountBalance: totalMarginAccountBalance
        .multipliedBy(10 ** asset.decimals)
        .toFixed(),
      unrealisedPNL: position.unrealisedPNL,
      updatedAt: position.updatedAt || null,
      productType: market?.tradableInstrument.instrument.product
        .__typename as ProductType,
    });
  });
  return metrics;
};

export const update = (
  data: PositionFieldsFragment[] | null,
  deltas: PositionsSubscriptionSubscription['positions']
) => {
  const updatedData = produce(data || [], (draft) => {
    deltas.forEach((delta) => {
      const { marketId, partyId, __typename, ...position } = delta;
      const index = draft.findIndex(
        (node) =>
          node.market.id === delta.marketId && node.party.id === delta.partyId
      );
      if (index !== -1) {
        const currNode = draft[index];
        draft[index] = {
          ...currNode,
          ...position,
        };
      } else {
        draft.unshift({
          ...position,
          __typename: 'Position',
          market: {
            __typename: 'Market',
            id: delta.marketId,
          },
          party: {
            __typename: 'Party',
            id: delta.partyId,
          },
        });
      }
    });
  });
  return updatedData;
};

const getSubscriptionVariables = (
  variables: PositionsQueryVariables
): PositionsSubscriptionSubscriptionVariables[] =>
  ([] as string[]).concat(variables.partyIds).map((partyId) => ({ partyId }));

export const positionsDataProvider = makeDataProvider<
  PositionsQuery,
  PositionFieldsFragment[],
  PositionsSubscriptionSubscription,
  PositionsSubscriptionSubscription['positions'],
  PositionsQueryVariables,
  PositionsSubscriptionSubscriptionVariables
>({
  query: PositionsDocument,
  subscriptionQuery: PositionsSubscriptionDocument,
  update,
  getData: (responseData: PositionsQuery | null) =>
    removePaginationWrapper(responseData?.positions?.edges) || [],
  getDelta: (subscriptionData: PositionsSubscriptionSubscription) =>
    subscriptionData.positions,
  getSubscriptionVariables,
  fetchPolicy: 'no-cache',
});

const positionDataProvider = makeDerivedDataProvider<
  PositionFieldsFragment,
  never,
  PositionsQueryVariables & MarketDataQueryVariables
>(
  [
    (callback, client, variables) =>
      positionsDataProvider(callback, client, {
        partyIds: variables.partyIds,
      }),
  ],
  (data, variables) => {
    return (
      (data[0] as PositionFieldsFragment[] | null)?.find(
        (p) => p.market.id === variables?.marketId
      ) || null
    );
  }
);

export type OpenVolumeData = Pick<
  PositionFieldsFragment,
  'openVolume' | 'averageEntryPrice'
>;

export const openVolumeDataProvider = makeDerivedDataProvider<
  OpenVolumeData,
  never,
  PositionsQueryVariables & MarketDataQueryVariables
>([positionDataProvider], ([data], variables, previousData) =>
  produce(previousData, (draft) => {
    if (!data) {
      return data;
    }
    const newData = {
      openVolume: (data as PositionFieldsFragment).openVolume,
      averageEntryPrice: (data as PositionFieldsFragment).averageEntryPrice,
    };
    return draft ? Object.assign(draft, newData) : newData;
  })
);

export const rejoinPositionData = (
  positions: PositionFieldsFragment[] | null,
  marketsData: MarketMaybeWithData[] | null
):
  | (Omit<PositionFieldsFragment, 'market'> & {
      market: MarketMaybeWithData | null;
    })[]
  | null => {
  if (positions && marketsData) {
    return positions.map((node) => {
      const market =
        marketsData?.find((market) => market.id === node.market.id) || null;
      return {
        ...node,
        market,
      };
    });
  }
  return null;
};

export const preparePositions = (metrics: Position[], showClosed: boolean) => {
  return sortBy(metrics, 'marketCode').filter((p) => {
    if (showClosed) {
      return true;
    }

    if (
      [
        MarketState.STATE_ACTIVE,
        MarketState.STATE_PENDING,
        MarketState.STATE_SUSPENDED,
        MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
      ].includes(p.marketState)
    ) {
      return true;
    }

    return false;
  });
};

export const positionsMarketsProvider = makeDerivedDataProvider<
  string[],
  never,
  PositionsQueryVariables
>([positionsDataProvider], ([positions]) => {
  return Array.from(
    new Set(
      (positions as PositionFieldsFragment[]).map(
        (position) => position.market.id
      )
    )
  ).sort();
});

const firstOrSelf = (partyIds: string | string[]) =>
  Array.isArray(partyIds) ? partyIds[0] : partyIds;

export const positionsMetricsProvider = makeDerivedDataProvider<
  Position[],
  Position[],
  PositionsQueryVariables & { marketIds: string[]; showClosed: boolean }
>(
  [
    (callback, client, variables) =>
      positionsDataProvider(callback, client, { partyIds: variables.partyIds }),
    (callback, client, variables) =>
      accountsDataProvider(callback, client, {
        partyId: firstOrSelf(variables.partyIds),
      }),
    (callback, client, variables) =>
      allMarketsWithLiveDataProvider(callback, client, {
        marketIds: variables.marketIds,
      }),
    (callback, client, variables) =>
      marginsDataProvider(callback, client, {
        partyId: firstOrSelf(variables.partyIds),
      }),
  ],
  ([positions, accounts, marketsData, margins], variables) => {
    const positionsData = rejoinPositionData(positions, marketsData);
    const metrics = getMetrics(
      positionsData,
      accounts as Account[] | null,
      margins
    );
    return preparePositions(metrics, variables.showClosed);
  },
  (data, delta, previousData) =>
    data.filter((row) => {
      const previousRow = previousData?.find(
        (previousRow) => previousRow.marketId === row.marketId
      );
      return !(previousRow && isEqual(previousRow, row));
    })
);

const getMaxLeverage = (market: MarketInfo | null) => {
  if (!market || !market?.riskFactors) {
    return 1;
  }
  const maxLeverage =
    1 /
    (Math.max(
      Number(market.riskFactors.long),
      Number(market.riskFactors.short)
    ) + Number(market.linearSlippageFactor) || 1);
  return maxLeverage;
};

export const maxMarketLeverageProvider = makeDerivedDataProvider<
  number,
  never,
  { marketId: string }
>(
  [
    (callback, client, { marketId }) =>
      marketInfoProvider(callback, client, { marketId }),
  ],
  (parts) => getMaxLeverage(parts[0])
);

export const maxLeverageProvider = makeDerivedDataProvider<
  number,
  never,
  { partyId: string; marketId: string }
>(
  [
    (callback, client, { marketId }) =>
      marketInfoProvider(callback, client, { marketId }),
    (callback, client, { marketId, partyId }) =>
      positionDataProvider(callback, client, { partyIds: partyId, marketId }),
    marketMarginDataProvider,
  ],
  (parts) => {
    const market: MarketInfo | null = parts[0];
    const position: PositionFieldsFragment | null = parts[1];
    const margin: MarginFieldsFragment | null = parts[2];
    const maxLeverage = getMaxLeverage(market);

    if (
      market &&
      position?.openVolume &&
      position?.openVolume !== '0' &&
      margin
    ) {
      const asset = getAsset(market);
      const { positionDecimalPlaces, decimalPlaces: marketDecimalPlaces } =
        market;
      const openVolume = toBigNum(
        position.openVolume.replace(/^-/, ''),
        positionDecimalPlaces
      );
      const averageEntryPrice = toBigNum(
        position.averageEntryPrice,
        marketDecimalPlaces
      );
      // https://github.com/vegaprotocol/specs/blob/nebula/protocol/0019-MCAL-margin_calculator.md#isolated-margin-mode
      return Math.min(
        averageEntryPrice
          .multipliedBy(openVolume)
          .dividedBy(toBigNum(margin.initialLevel, asset.decimals))
          .toNumber(),
        maxLeverage
      );
    }
    return maxLeverage;
  }
);

export const useMaxLeverage = (
  marketId: string,
  partyId: string | undefined
) => {
  return useDataProvider({
    dataProvider: partyId ? maxLeverageProvider : maxMarketLeverageProvider,
    variables: { marketId, partyId: partyId || '' },
  });
};
