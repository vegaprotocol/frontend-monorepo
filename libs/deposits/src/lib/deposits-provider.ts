import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import { getEvents } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  useDataProvider,
  defaultAppend as append,
  type Cursor,
} from '@vegaprotocol/data-provider';
import {
  BusEventType,
  type Pagination,
  type DateRange,
} from '@vegaprotocol/types';
import {
  DepositsDocument,
  DepositEventDocument,
  type DepositFieldsFragment,
  type DepositsQuery,
  type DepositEventSubscription,
  type DepositEventSubscriptionVariables,
} from './__generated__/Deposit';

const getPageInfo = (responseData: DepositsQuery) =>
  responseData?.party?.depositsConnection?.pageInfo || null;

export const depositsProvider = makeDataProvider<
  DepositsQuery,
  Array<DepositFieldsFragment & Cursor>,
  DepositEventSubscription,
  DepositEventSubscription,
  DepositEventSubscriptionVariables
>({
  query: DepositsDocument,
  subscriptionQuery: DepositEventDocument,
  getData: (data: DepositsQuery | null) => {
    if (!data?.party?.depositsConnection?.edges?.length) return [];

    return orderBy(
      compact(data.party.depositsConnection.edges).map((edge) => ({
        ...edge.node,
        cursor: edge.cursor,
      })),
      ['createdTimestamp'],
      ['desc']
    );
  },
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
  pagination: {
    getPageInfo,
    append,
    first: 1000,
  },
});

export const useDeposits = ({
  pubKey,
  dateRange,
  pagination,
}: {
  pubKey?: string;
  dateRange?: DateRange;
  pagination?: Pagination;
}) => {
  return useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '', dateRange, pagination },
    skip: !pubKey,
  });
};
