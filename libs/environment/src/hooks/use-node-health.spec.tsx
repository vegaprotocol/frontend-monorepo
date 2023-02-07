import { renderHook, waitFor } from '@testing-library/react';
import { useNodeHealth } from './use-node-health';
import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import type { StatisticsQuery } from '../utils/__generated__/Node';
import { StatisticsDocument } from '../utils/__generated__/Node';
import { useEnvironment } from './use-environment';
import { useHeaderStore } from '@vegaprotocol/apollo-client';

const vegaUrl = 'https://foo.bar.com';

jest.mock('./use-environment');
jest.mock('@vegaprotocol/apollo-client');

// @ts-ignore ignore mock implementation
useEnvironment.mockImplementation(() => ({
  VEGA_URL: vegaUrl,
}));

const createStatsMock = (
  blockHeight: number
): MockedResponse<StatisticsQuery> => {
  return {
    request: {
      query: StatisticsDocument,
    },
    result: {
      data: {
        statistics: {
          chainId: 'chain-id',
          blockHeight: blockHeight.toString(),
          vegaTime: '12345',
        },
      },
    },
  };
};

function setup(
  mock: MockedResponse<StatisticsQuery>,
  headers:
    | {
        blockHeight: number;
        timestamp: Date;
      }
    | undefined
) {
  // @ts-ignore ignore mock implementation
  useHeaderStore.mockImplementation(() => ({
    [vegaUrl]: headers,
  }));

  return renderHook(() => useNodeHealth(), {
    wrapper: ({ children }) => (
      <MockedProvider mocks={[mock]}>{children}</MockedProvider>
    ),
  });
}

describe('useNodeHealth', () => {
  it.each([
    { core: 1, node: 1, expected: 0 },
    { core: 1, node: 5, expected: -4 },
    { core: 10, node: 5, expected: 5 },
  ])(
    'provides difference core block $core and node block $node',
    async (cases) => {
      const { result } = setup(createStatsMock(cases.core), {
        blockHeight: cases.node,
        timestamp: new Date(),
      });
      expect(result.current.blockDiff).toEqual(null);
      expect(result.current.coreBlockHeight).toEqual(undefined);
      expect(result.current.datanodeBlockHeight).toEqual(cases.node);
      await waitFor(() => {
        expect(result.current.blockDiff).toEqual(cases.expected);
        expect(result.current.coreBlockHeight).toEqual(cases.core);
        expect(result.current.datanodeBlockHeight).toEqual(cases.node);
      });
    }
  );

  it('block diff is null if query fails indicating non operational', async () => {
    const failedQuery: MockedResponse<StatisticsQuery> = {
      request: {
        query: StatisticsDocument,
      },
      result: {
        // @ts-ignore failed query with no result
        data: {},
      },
    };
    const { result } = setup(failedQuery, {
      blockHeight: 1,
      timestamp: new Date(),
    });
    expect(result.current.blockDiff).toEqual(null);
    expect(result.current.coreBlockHeight).toEqual(undefined);
    expect(result.current.datanodeBlockHeight).toEqual(1);
    await waitFor(() => {
      expect(result.current.blockDiff).toEqual(null);
      expect(result.current.coreBlockHeight).toEqual(undefined);
      expect(result.current.datanodeBlockHeight).toEqual(1);
    });
  });

  it('returns 0 if no headers are found (wait until stats query resolves)', async () => {
    const { result } = setup(createStatsMock(1), undefined);
    expect(result.current.blockDiff).toEqual(null);
    expect(result.current.coreBlockHeight).toEqual(undefined);
    expect(result.current.datanodeBlockHeight).toEqual(undefined);
    await waitFor(() => {
      expect(result.current.blockDiff).toEqual(0);
      expect(result.current.coreBlockHeight).toEqual(1);
      expect(result.current.datanodeBlockHeight).toEqual(undefined);
    });
  });
});
