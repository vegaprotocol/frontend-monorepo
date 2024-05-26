import { makeDataProvider, useDataProvider } from '@vegaprotocol/data-provider';
import {
  TransfersDocument,
  type TransfersQuery,
  type TransferFieldsFragment,
  type TransfersQueryVariables,
} from './__generated__/Transfers';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useEffect } from 'react';

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
  const queryResult = useDataProvider({
    dataProvider: transfersProvider,
    variables: { partyId: pubKey || '', pagination: { first: 10 } },
    skip: !pubKey,
  });

  // No subscription exists for updating transfers
  useEffect(() => {
    const interval = setInterval(queryResult.reload, 5000);
    return () => clearInterval(interval);
  }, [queryResult.reload]);

  return queryResult;
};
