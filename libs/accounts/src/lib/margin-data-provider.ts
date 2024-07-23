import produce from 'immer';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import {
  MarginsSubscriptionDocument,
  MarginsDocument,
  type MarginsQuery,
  type MarginFieldsFragment,
  type MarginsSubscriptionSubscription,
  type MarginsQueryVariables,
} from './__generated__/Margins';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { MarginMode } from '@vegaprotocol/types';

const update = (
  data: MarginFieldsFragment[] | null,
  delta: MarginsSubscriptionSubscription['margins']
) => {
  return produce(data || [], (draft) => {
    const { marketId } = delta;
    const index = draft.findIndex((node) => node.market.id === marketId);
    const deltaData = {
      maintenanceLevel: delta.maintenanceLevel,
      searchLevel: delta.searchLevel,
      initialLevel: delta.initialLevel,
      collateralReleaseLevel: delta.collateralReleaseLevel,
      marginFactor: delta.marginFactor,
      marginMode: delta.marginMode,
      orderMarginLevel: delta.orderMarginLevel,
    };
    if (index !== -1) {
      const currNode = draft[index];
      draft[index] = {
        ...currNode,
        ...deltaData,
      };
    } else {
      draft.unshift({
        __typename: 'MarginLevels',
        market: {
          __typename: 'Market',
          id: delta.marketId,
        },
        ...deltaData,
        asset: {
          __typename: 'Asset',
          id: delta.asset,
        },
      });
    }
  });
};

const getData = (responseData: MarginsQuery | null) =>
  removePaginationWrapper(responseData?.party?.marginsConnection?.edges) || [];

const getDelta = (subscriptionData: MarginsSubscriptionSubscription) =>
  subscriptionData.margins;

export const marginsDataProvider = makeDataProvider<
  MarginsQuery,
  MarginFieldsFragment[],
  MarginsSubscriptionSubscription,
  MarginsSubscriptionSubscription['margins'],
  MarginsQueryVariables
>({
  query: MarginsDocument,
  subscriptionQuery: MarginsSubscriptionDocument,
  update,
  getData,
  getDelta,
});

export const marketMarginDataProvider = makeDerivedDataProvider<
  MarginFieldsFragment,
  never,
  MarginsQueryVariables & { marketId: string }
>(
  [marginsDataProvider],
  (data, { marketId }) =>
    (data[0] as MarginFieldsFragment[]).find(
      (margin) => margin.market.id === marketId
    ) || null
);

export type MarginModeData = Pick<
  MarginFieldsFragment,
  'marginMode' | 'marginFactor'
>;

export const marginModeDataProvider = makeDerivedDataProvider<
  MarginModeData,
  never,
  MarginsQueryVariables & { marketId: string }
>([marketMarginDataProvider], ([data], variables, previousData) =>
  produce(previousData, (draft) => {
    if (!data) {
      return data;
    }
    const newData = {
      marginMode: (data as MarginFieldsFragment).marginMode,
      marginFactor: (data as MarginFieldsFragment).marginFactor,
    };
    return draft ? Object.assign(draft, newData) : newData;
  })
);

export const useMarginMode = (marketId?: string) => {
  const { pubKey } = useVegaWallet();
  const result = useDataProvider({
    dataProvider: marginModeDataProvider,
    variables: {
      partyId: pubKey || '',
      marketId: marketId || '',
    },
    skip: !pubKey || !marketId,
  });

  return {
    ...result,
    data: {
      marginMode:
        result.data?.marginMode || MarginMode.MARGIN_MODE_CROSS_MARGIN,
      marginFactor: result.data?.marginFactor || '0',
    },
  };
};
