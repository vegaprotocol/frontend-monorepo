import createClient from './apollo-client';
import { StatisticsDocument } from './__generated__/Statistics';
import { BlockTimeDocument } from './__generated__/BusEvents';
import type { StatisticsQuery } from './__generated__/Statistics';

type Callbacks = {
  onStatsSuccess: (data: StatisticsQuery) => void;
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
    .query<StatisticsQuery>({
      query: StatisticsDocument,
    })
    .then((res) => {
      onStatsSuccess(res.data);
    })
    .catch(() => {
      onStatsFailure();
    });

  const subscription = client
    .subscribe({
      query: BlockTimeDocument,
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
