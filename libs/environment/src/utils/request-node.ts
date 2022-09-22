import createClient from './apollo-client';
import { StatisticsDocument, BlockTimeDocument } from './__generated__/Node';
import type { StatisticsQuery, BlockTimeSubscription } from './__generated__/Node';

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
    .subscribe<BlockTimeSubscription>({
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
