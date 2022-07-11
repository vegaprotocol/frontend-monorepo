import { MockedProvider } from '@apollo/client/testing';
import { STATS_QUERY, TIME_UPDATE_SUBSCRIPTION } from '../request-node';

export const MOCK_STATISTICS_QUERY_RESULT = {
  blockHeight: '11',
  chainId: 'testnet_01234',
};

console.log(STATS_QUERY)

export class MockClient {
  constructor ({
    failStats = false,
    failSubscription = false,
  }: { failStats?: boolean; failSubscription?: boolean } = {}) {
    const provider = new MockedProvider({
      mocks: [
        {
          request: {
            query: STATS_QUERY,
          },
          result: failStats
            ? undefined
            : {
                data: {
                  statistics: {
                    __typename: 'Statistics',
                    ...MOCK_STATISTICS_QUERY_RESULT,
                  },
                },
              },
        },
        {
          request: {
            query: TIME_UPDATE_SUBSCRIPTION,
          },
          result: failSubscription
            ? undefined
            : {
                data: {
                  busEvents: {
                    eventId: 'time-0',
                  },
                },
              },
        },
      ],
    });

    return provider.state.client;
  }
}

const createMockClient = jest.fn().mockReturnValue(new MockClient());

export default createMockClient;
