import { makeDataProvider, useDataProvider } from '@vegaprotocol/data-provider';
import {
  TransfersDocument,
  type TransfersQuery,
  type TransferFieldsFragment,
  type TransfersQueryVariables,
} from './__generated__/Transfers';
import { removePaginationWrapper } from '@vegaprotocol/utils';

export const transfersProvider = makeDataProvider<
  TransfersQuery,
  TransferFieldsFragment[],
  never,
  never,
  TransfersQueryVariables
>({
  query: TransfersDocument,
  getData: (responseData) => {
    return removePaginationWrapper(
      responseData?.transfersConnection?.edges || []
    ).map((t) => t.transfer);
  },
});

export const useTransfers = ({ pubKey }: { pubKey?: string }) => {
  return useDataProvider({
    dataProvider: transfersProvider,
    variables: { partyId: pubKey || '', pagination: { first: 10 } },
    skip: !pubKey,
  });
};
