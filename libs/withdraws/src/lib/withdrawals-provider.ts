import uniqBy from 'lodash/uniqBy';
import { makeDataProvider } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  WithdrawalsDocument,
  WithdrawalEventDocument,
} from './__generated__/Withdrawal';
import type {
  WithdrawalsQuery,
  WithdrawalFieldsFragment,
  WithdrawalEventSubscription,
  WithdrawalEventSubscriptionVariables,
} from './__generated__/Withdrawal';
import { removePaginationWrapper, getEvents } from '@vegaprotocol/utils';

const sortWithdrawals = (data: WithdrawalFieldsFragment[]) =>
  data.sort((a, b) => {
    if (!b.txHash !== !a.txHash) {
      return b.txHash ? -1 : 1;
    }
    return (b.txHash ? b.withdrawnTimestamp : b.createdTimestamp).localeCompare(
      a.txHash ? a.withdrawnTimestamp : a.createdTimestamp
    );
  });

export const withdrawalProvider = makeDataProvider<
  WithdrawalsQuery,
  WithdrawalFieldsFragment[],
  WithdrawalEventSubscription,
  WithdrawalEventSubscription,
  WithdrawalEventSubscriptionVariables
>({
  query: WithdrawalsDocument,
  subscriptionQuery: WithdrawalEventDocument,
  getData: (data: WithdrawalsQuery | null) =>
    sortWithdrawals(
      removePaginationWrapper(data?.party?.withdrawalsConnection?.edges || [])
    ),
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
});
