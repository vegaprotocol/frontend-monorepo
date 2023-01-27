import { StatisticsDocument, BlockTimeDocument } from './__generated__/Node';
import type {
  StatisticsQuery,
  BlockTimeSubscription,
} from './__generated__/Node';
import { createClient } from '@vegaprotocol/apollo-client';

type Callbacks = {
  onStatsSuccess: (data: StatisticsQuery) => void;
  onStatsFailure: () => void;
  onSubscriptionSuccess: () => void;
  onSubscriptionFailure: () => void;
};

const SUBSCRIPTION_TIMEOUT = 3000;

/**
 * Makes a single stats request and attempts a subscrition to VegaTime
 * to determine whether or not a node is suitable for use
 */
export const requestNode = (
  url: string,
  {
    onStatsSuccess,
    onStatsFailure,
    onSubscriptionSuccess,
    onSubscriptionFailure,
  }: Callbacks
) => {
  // check url is a valid url
  try {
    new URL(url);
  } catch (err) {
    onStatsFailure();
    onSubscriptionFailure();
    return;
  }

  let subscriptionSucceeded = false;

  const client = createClient({
    url,
    retry: false,
    connectToDevTools: false,
  });

  // make a query for block height
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

  // start a subscription for VegaTime and await the first message
  const subscription = client
    .subscribe<BlockTimeSubscription>({
      query: BlockTimeDocument,
      errorPolicy: 'all',
    })
    .subscribe({
      next() {
        subscriptionSucceeded = true;
        onSubscriptionSuccess();
        subscription.unsubscribe();
      },
      error() {
        onSubscriptionFailure();
        subscription.unsubscribe();
      },
    });

  // start a timeout, if the above subscription doesn't yield any messages
  // before the timeout has completed consider it failed
  setTimeout(() => {
    if (!subscriptionSucceeded) {
      onSubscriptionFailure();
      subscription.unsubscribe();
    }
  }, SUBSCRIPTION_TIMEOUT);

  return client;
};
