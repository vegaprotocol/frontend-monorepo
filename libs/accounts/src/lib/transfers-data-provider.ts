import compact from 'lodash/compact';
import {
  makeDataProvider,
  useDataProvider,
  defaultAppend as append,
  type Cursor,
} from '@vegaprotocol/data-provider';
import {
  TransfersDocument,
  type TransfersQuery,
  type TransferFieldsFragment,
  type TransfersQueryVariables,
} from './__generated__/Transfers';
import { useEffect } from 'react';
import { type Pagination } from '@vegaprotocol/types';

export const transfersProvider = makeDataProvider<
  TransfersQuery,
  Array<TransferFieldsFragment & Cursor>,
  never,
  never,
  TransfersQueryVariables
>({
  query: TransfersDocument,
  getData: (responseData) => {
    if (!responseData?.transfersConnection?.edges?.length) return [];

    return compact(responseData.transfersConnection.edges).map((edge) => ({
      ...edge.node.transfer,
      cursor: edge.cursor,
    }));
  },
  pagination: {
    getPageInfo: (responseData: TransfersQuery) =>
      responseData?.transfersConnection?.pageInfo || null,
    append,
    first: 1000,
  },
});

export const useTransfers = ({
  pubKey,
  pagination,
}: {
  pubKey?: string;
  pagination?: Pagination;
}) => {
  const queryResult = useDataProvider({
    dataProvider: transfersProvider,
    variables: { partyId: pubKey || '', pagination },
    skip: !pubKey,
  });

  // No subscription exists for updating transfers
  useEffect(() => {
    const interval = setInterval(queryResult.reload, 10000);
    return () => clearInterval(interval);
  }, [queryResult.reload]);

  return queryResult;
};
