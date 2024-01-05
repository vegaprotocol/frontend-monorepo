import { removePaginationWrapper } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import {
  MarginModesDocument,
  type MarginModesQueryVariables,
  MarginModesQuery,
  MarginModeFragment,
} from './__generated__/Positions';

export const marginModesDataProvider = makeDataProvider<
  MarginModesQuery,
  MarginModeFragment[],
  never,
  never,
  MarginModesQueryVariables
>({
  query: MarginModesDocument,
  getData: (responseData: MarginModesQuery | null) =>
    removePaginationWrapper(responseData?.partyMarginModes?.edges) || [],
});

export const marginModeDataProvider = makeDerivedDataProvider<
  MarginModeFragment | undefined,
  never,
  MarginModesQueryVariables & { marketId: string }
>(
  [
    (callback, client, variables) =>
      marginModesDataProvider(callback, client, { partyId: variables.partyId }),
  ],
  (data, variables) =>
    (data as MarginModeFragment[]).find(
      (marginMode) => marginMode.marketId === variables.marketId
    )
);
