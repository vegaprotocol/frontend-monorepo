import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import {
  getEvents,
  makeDataProvider,
  removePaginationWrapper,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  DepositsDocument,
  DepositEventDocument,
} from './__generated__/Deposit';
import type {
  DepositFieldsFragment,
  DepositsQuery,
  DepositEventSubscription,
  DepositEventSubscriptionVariables,
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
      Schema.BusEventType.Deposit,
      delta.busEvents
    );
    return uniqBy([...incoming, ...(data || [])], 'id');
  },
});
