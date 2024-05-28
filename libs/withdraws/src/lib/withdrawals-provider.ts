import uniqBy from 'lodash/uniqBy';
import compact from 'lodash/compact';
import { removePaginationWrapper, getEvents } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  useDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import {
  WithdrawalsDocument,
  WithdrawalEventDocument,
  type WithdrawalsQuery,
  type WithdrawalFieldsFragment,
  type WithdrawalEventSubscription,
  type WithdrawalEventSubscriptionVariables,
} from './__generated__/Withdrawal';

const sortWithdrawals = (data: WithdrawalFieldsFragment[]) =>
  data.sort((a, b) => {
    if (!b.txHash !== !a.txHash) {
      return b.txHash ? -1 : 1;
    }
    return (b.txHash ? b.withdrawnTimestamp : b.createdTimestamp).localeCompare(
      a.txHash ? a.withdrawnTimestamp : a.createdTimestamp
    );
  });

const getPageInfo = (responseData: any) => {
  return responseData?.party?.withdrawalsConnection?.pageInfo || null;
};

export const withdrawalProvider = makeDataProvider<
  WithdrawalsQuery,
  WithdrawalFieldsFragment[],
  WithdrawalEventSubscription,
  WithdrawalEventSubscription,
  WithdrawalEventSubscriptionVariables
>({
  query: WithdrawalsDocument,
  subscriptionQuery: WithdrawalEventDocument,
  getData: (responseData: WithdrawalsQuery | null) => {
    if (!responseData?.party?.withdrawalsConnection?.edges?.length) return [];

    const data = compact(responseData.party.withdrawalsConnection.edges).map(
      (edge) => ({ ...edge.node, cursor: edge.cursor })
    );

    return sortWithdrawals(data);
  },
  getDelta: (data: WithdrawalEventSubscription) => data,
  update: (
    data: WithdrawalFieldsFragment[] | null,
    delta: WithdrawalEventSubscription
  ) => {
    if (!delta.busEvents?.length) {
      return data;
    }
    const incoming = getEvents<WithdrawalFieldsFragment>(
      Schema.BusEventType.Withdrawal,
      delta.busEvents
    );
    return uniqBy([...incoming, ...(data || [])], 'id');
  },
  pagination: {
    getPageInfo,
    append,
    first: 3,
  },
});

export const useWithdrawals = ({
  pubKey,
  dateRange,
  pagination,
}: {
  pubKey?: string;
  dateRange?: Schema.DateRange;
  pagination?: Schema.Pagination;
}) => {
  return useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '', dateRange, pagination },
    skip: !pubKey,
  });
};
