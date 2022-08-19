import { gql } from '@apollo/client';
import createClient from './apollo-client';
import type { Statistics } from './__generated__/Statistics';

export const STATS_QUERY = gql`
  query Statistics {
    statistics {
      chainId
      blockHeight
    }
  }
`;

export const TIME_UPDATE_SUBSCRIPTION = gql`
  subscription BlockTime {
    busEvents(types: TimeUpdate, batchSize: 1) {
      id
    }
  }
`;

type Callbacks = {
  onStatsSuccess: (data: Statistics) => void;
  onStatsFailure: () => void;
  onSubscriptionSuccess: () => void;
  onSubscriptionFailure: () => void;
};

export const requestNode = (
  url: string,
  {
    onStatsSuccess,
    onStatsFailure,
    onSubscriptionSuccess,
    onSubscriptionFailure,
  }: Callbacks
) => {
  try {
    new URL(url);
  } catch (err) {
    onStatsFailure();
    onSubscriptionFailure();
    return;
  }

  const client = createClient(url);

  client
    .query<Statistics>({
      query: STATS_QUERY,
    })
    .then((res) => {
      onStatsSuccess(res.data);
    })
    .catch(() => {
      onStatsFailure();
    });

  const subscription = client
    .subscribe({
      query: TIME_UPDATE_SUBSCRIPTION,
      errorPolicy: 'all',
    })
    .subscribe({
      next() {
        onSubscriptionSuccess();
        subscription.unsubscribe();
      },
      error() {
        onSubscriptionFailure();
        subscription.unsubscribe();
      },
    });

  return client;
};
