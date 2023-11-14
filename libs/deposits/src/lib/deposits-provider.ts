import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import { getEvents, removePaginationWrapper } from '@vegaprotocol/utils';
import { makeDataProvider } from '@vegaprotocol/data-provider';
import { BusEventType } from '@vegaprotocol/types';
import {
  DepositsDocument,
  DepositEventDocument,
  type DepositFieldsFragment,
  type DepositsQuery,
  type DepositEventSubscription,
  type DepositEventSubscriptionVariables,
} from './__generated__/Deposit';

export const depositsProvider = makeDataProvider<
  DepositsQuery,
  DepositFieldsFragment[],
  DepositEventSubscription,
  DepositEventSubscription,
  DepositEventSubscriptionVariables
>({
  query: DepositsDocument,
  subscriptionQuery: DepositEventDocument,
  getData: (data: DepositsQuery | null) =>
    orderBy(
      removePaginationWrapper(data?.party?.depositsConnection?.edges || []),
      ['createdTimestamp'],
      ['desc']
    ),
  getDelta: (data: DepositEventSubscription) => data,
  update: (
    data: DepositFieldsFragment[] | null,
    delta: DepositEventSubscription
  ) => {
    if (!delta.busEvents?.length) {
      return data;
    }
    const incoming = getEvents<DepositFieldsFragment>(
      BusEventType.Deposit,
      delta.busEvents
    );
    return uniqBy([...incoming, ...(data || [])], 'id');
  },
});
