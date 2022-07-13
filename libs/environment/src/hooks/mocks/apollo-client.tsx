// import type { DocumentNode } from '@apollo/client';
// import { ApolloClient, InMemoryCache } from '@apollo/client';
// import { MockLink } from '@apollo/client/testing';
import {
  STATS_QUERY,
  TIME_UPDATE_SUBSCRIPTION,
} from '../../utils/request-node';
import { BLOCK_HEIGHT_QUERY } from '../../components/node-switcher/node-block-height';
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

export const getMockQueryResult = (env: Networks): Statistics => ({
  statistics: {
    __typename: 'Statistics',
    chainId: `${env.toLowerCase()}-0123`,
    blockHeight: '11',
  },
});

// type QueryMockProps<T> = MockRequestConfig & {
//   query: DocumentNode;
//   data: T;
// };

// function getQueryMock<T>({ query, data, hasError, delay }: QueryMockProps<T>) {
//   return {
//     request: {
//       query,
//     },
//     delay,
//     result: { data, newData: () => data },
//     error: hasError ? new Error('Error executing query') : undefined,
//   };
// }

// export default function createMockClient({
//   network = Networks.TESTNET,
//   statistics,
//   busEvents,
// }: MockClientProps = {}) {
//   return new ApolloClient({
//     cache: new InMemoryCache(),
//     link: new MockLink([
//       getQueryMock({
//         ...statistics,
//         query: STATS_QUERY,
//         data: getMockQueryResult(network),
//       }),
//       getQueryMock({
//         ...busEvents,
//         query: TIME_UPDATE_SUBSCRIPTION,
//         data: getMockBusEventsResult(),
//       }),
//     ]),
//   });
// }

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
    getHandler(statistics, getMockStatisticsResult(network))
  );

  return mockClient;
}
