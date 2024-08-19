import compact from 'lodash/compact';
import { useTransfersQuery } from './__generated__/Transfers';
import { type Pagination } from '@vegaprotocol/types';

export const useTransfers = ({
  pubKey,
  pagination,
}: {
  pubKey?: string;
  pagination?: Pagination;
}) => {
  const queryResult = useTransfersQuery({
    variables: { partyId: pubKey || '', pagination },
    skip: !pubKey,
    pollInterval: 5000,
  });

  return {
    ...queryResult,
    data: compact(queryResult.data?.transfersConnection?.edges).map((edge) => ({
      ...edge.node.transfer,
      cursor: edge.cursor,
    })),
    pageInfo: queryResult.data?.transfersConnection?.pageInfo,
  };
};
