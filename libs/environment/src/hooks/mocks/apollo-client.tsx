import {
  STATS_QUERY,
  TIME_UPDATE_SUBSCRIPTION,
} from '../../utils/request-node';
import { BLOCK_HEIGHT_QUERY } from '../../components/node-switcher/node-block-height';
import type { BlockHeightStats } from '../../components/node-switcher/__generated__/BlockHeightStats';
import type { Statistics } from '../../utils/__generated__/Statistics';
import type { BlockTime } from '../../utils/__generated__/BlockTime';
import { Networks } from '../../types';
import type { RequestHandlerResponse } from 'mock-apollo-client';
import { createMockClient } from 'mock-apollo-client';

export type MockRequestConfig = {
  hasError?: boolean;
  delay?: number;
};

type MockClientProps = {
  network?: Networks;
  statistics?: MockRequestConfig;
  busEvents?: MockRequestConfig;
};

export const getMockBusEventsResult = (): BlockTime => ({
  busEvents: [
    {
      __typename: 'BusEvent',
      eventId: '0',
    },
  ],
});

export const getMockStatisticsResult = (
  env: Networks = Networks.TESTNET
): Statistics => ({
  statistics: {
    __typename: 'Statistics',
    chainId: `${env.toLowerCase()}-0123`,
    blockHeight: '11',
  },
});

export const getMockStatisticsBlockHeightResult = (
  env: Networks = Networks.TESTNET
): BlockHeightStats => ({
  statistics: {
    __typename: 'Statistics',
    blockHeight: '11',
  },
});

export const getMockQueryResult = (env: Networks): Statistics => ({
  statistics: {
    __typename: 'Statistics',
    chainId: `${env.toLowerCase()}-0123`,
    blockHeight: '11',
  },
});

const getHandler = (
  { hasError, delay = 0 }: MockRequestConfig = {},
  result: any
) => {
  return () =>
    new Promise<RequestHandlerResponse<any>>((resolve, reject) => {
      setTimeout(() => {
        if (hasError) {
          reject(new Error('Failed to execute query.'));
          return;
        }
        resolve({ data: result });
      }, delay);
    });
};

export default function ({
  network,
  statistics,
  busEvents,
}: MockClientProps = {}) {
  const mockClient = createMockClient();

  mockClient.setRequestHandler(
    STATS_QUERY,
    getHandler(statistics, getMockStatisticsResult(network))
  );
  mockClient.setRequestHandler(
    TIME_UPDATE_SUBSCRIPTION,
    getHandler(busEvents, getMockBusEventsResult())
  );
  mockClient.setRequestHandler(
    BLOCK_HEIGHT_QUERY,
    getHandler(statistics, getMockStatisticsBlockHeightResult())
  );

  return mockClient;
}
