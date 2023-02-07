import {
  StatisticsDocument,
  BlockTimeDocument,
} from '../../utils/__generated__/Node';
import type {
  StatisticsQuery,
  BlockTimeSubscription,
} from '../../utils/__generated__/Node';
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

export const getMockBusEventsResult = (): BlockTimeSubscription => ({
  busEvents: [
    {
      __typename: 'BusEvent',
      id: '0',
    },
  ],
});

export const getMockStatisticsResult = (
  env: Networks = Networks.TESTNET
): StatisticsQuery => ({
  statistics: {
    __typename: 'Statistics',
    chainId: `${env.toLowerCase()}-0123`,
    blockHeight: '11',
    vegaTime: new Date().toISOString(),
  },
});

export const getMockQueryResult = (env: Networks): StatisticsQuery => ({
  statistics: {
    __typename: 'Statistics',
    chainId: `${env.toLowerCase()}-0123`,
    blockHeight: '11',
    vegaTime: new Date().toISOString(),
  },
});

function getHandler<T>(
  { hasError, delay = 0 }: MockRequestConfig = {},
  result: T
) {
  return () =>
    new Promise<RequestHandlerResponse<T>>((resolve, reject) => {
      setTimeout(() => {
        if (hasError) {
          reject(new Error('Failed to execute query.'));
          return;
        }
        resolve({ data: result });
      }, delay);
    });
}

export default function ({
  network,
  statistics,
  busEvents,
}: MockClientProps = {}) {
  const mockClient = createMockClient();

  mockClient.setRequestHandler(
    StatisticsDocument,
    getHandler(statistics, getMockStatisticsResult(network))
  );
  mockClient.setRequestHandler(
    BlockTimeDocument,
    getHandler(busEvents, getMockBusEventsResult())
  );

  return mockClient;
}
