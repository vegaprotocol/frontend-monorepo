// import { ApolloClient, InMemoryCache, DocumentNode } from '@apollo/client';
import { STATS_QUERY, TIME_UPDATE_SUBSCRIPTION } from '../../utils/request-node';
import type { Statistics } from '../../utils/__generated__/Statistics';
import type { BlockTime } from '../../utils/__generated__/BlockTime';
import { Networks } from '../../types';
import { createMockClient, RequestHandlerResponse } from 'mock-apollo-client';

export type MockRequestConfig = {
  hasError?: boolean;
  delay?: number;
}

type MockClientProps = {
  network?: Networks,
  query?: MockRequestConfig;
  subscription?: MockRequestConfig;
}

const getMockBusEventsResult = (): BlockTime => ({
  busEvents: [{
    __typename: 'BusEvent',
    eventId: '0',
  }],
});

export const getMockStatisticsResult = (env: Networks = Networks.TESTNET): Statistics => ({
  statistics: {
    __typename: 'Statistics',
    chainId: `${env.toLowerCase()}-0123`,
    blockHeight: '11',
  }
});

function getHandler <T>({ hasError, delay = 0 }: MockRequestConfig = {}, result: T) {
  return () => new Promise<RequestHandlerResponse<T>>((resolve, reject) => {
    console.log('EXECUTING!!', delay)
    setTimeout(() => {
      console.log('EXECUTING TIMEOUT!!')
      if (hasError) {
        reject(new Error('Failed to execute query.'));
        return;
      }
      console.log('RESOLVING!', result)
      resolve({ data: result });
    }, delay)
  });
}

export default function ({ network, query, subscription }: MockClientProps) {
  const mockClient = createMockClient();

  mockClient.setRequestHandler(STATS_QUERY, getHandler(query, getMockStatisticsResult(network)));
  mockClient.setRequestHandler(TIME_UPDATE_SUBSCRIPTION, getHandler(subscription, getMockBusEventsResult()));

  return mockClient;
}

// export const getMockQueryResult = (env: Networks): Statistics => ({
//   statistics: {
//     __typename: 'Statistics',
//     chainId: `${env.toLowerCase()}-0123`,
//     blockHeight: '11',
//   }
// });
//
// const MOCK_SUBSCRIPTION_RESULT: BlockTime = {
//   busEvents: [{
//     __typename: 'BusEvent',
//     eventId: '0',
//   }]
// }
//
//
// type QueryMockProps<T> = MockLinkConfig & {
//   query: DocumentNode,
//   data: T,
// }
//
// function getQueryMock <T> ({ query, data, hasError, delay }: QueryMockProps<T>) {
//   return {
//     request: {
//       query,
//     },
//     delay,
//     result: { data, newData: () => data },
//     error: hasError ? new Error('Error executing query') : undefined,
//   };
// };
//
//
// export default function createMockClient ({
//   network = Networks.TESTNET,
//   query,
//   subscription,
// }: MockClientProps) {
//   return new ApolloClient({
//     cache: new InMemoryCache(),
//     link: new MockLink([
//       getQueryMock({ ...query, query: STATS_QUERY, data: getMockQueryResult(network) }),
//       getQueryMock({ ...subscription, query: TIME_UPDATE_SUBSCRIPTION, data: MOCK_SUBSCRIPTION_RESULT }),
//     ]),
//   });
// }
