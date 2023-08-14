import { renderHook, waitFor } from '@testing-library/react';
import { useNodeHealth } from './use-node-health';
import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import type { NodeCheckQuery } from '../utils/__generated__/NodeCheck';
import { NodeCheckDocument } from '../utils/__generated__/NodeCheck';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { Intent } from '@vegaprotocol/ui-toolkit';

const vegaUrl = 'https://foo.bar.com';

jest.mock('./use-environment', () => ({
  useEnvironment: () => vegaUrl,
}));
jest.mock('@vegaprotocol/apollo-client');

const createStatsMock = (
  blockHeight: number
): MockedResponse<NodeCheckQuery> => {
  return {
    request: {
      query: NodeCheckDocument,
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
  mock: MockedResponse<NodeCheckQuery>,
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
    {
      core: 1,
      node: 1,
      expectedText: 'Operational',
      expectedIntent: Intent.Success,
    },
    {
      core: 1,
      node: 5,
      expectedText: 'Operational',
      expectedIntent: Intent.Success,
    },
    {
      core: 10,
      node: 5,
      expectedText: '5 Blocks behind',
      expectedIntent: Intent.Warning,
    },
  ])(
    'provides difference core block $core and node block $node',
    async (cases) => {
      const { result } = setup(createStatsMock(cases.core), {
        blockHeight: cases.node,
        timestamp: new Date(),
      });
      expect(result.current.text).toEqual('Non operational');
      expect(result.current.intent).toEqual(Intent.Danger);
      expect(result.current.datanodeBlockHeight).toEqual(cases.node);
      await waitFor(() => {
        expect(result.current.text).toEqual(cases.expectedText);
        expect(result.current.intent).toEqual(cases.expectedIntent);
        expect(result.current.datanodeBlockHeight).toEqual(cases.node);
      });
    }
  );

  // eslint-disable-next-line
  it.skip('block diff is null if query fails indicating non operational', async () => {
    const failedQuery: MockedResponse<NodeCheckQuery> = {
      request: {
        query: NodeCheckDocument,
      },
      // @ts-ignore failed query with no result
      result: {
        data: {},
      },
    };
    const { result } = setup(failedQuery, {
      blockHeight: 1,
      timestamp: new Date(),
    });
    expect(result.current.text).toEqual('Non operational');
    expect(result.current.intent).toEqual(Intent.Danger);
    expect(result.current.datanodeBlockHeight).toEqual(1);
    await waitFor(() => {
      expect(result.current.text).toEqual('Non operational');
      expect(result.current.intent).toEqual(Intent.Danger);
      expect(result.current.datanodeBlockHeight).toEqual(1);
    });
  });

  it('returns 0 if no headers are found (waits until stats query resolves)', async () => {
    const { result } = setup(createStatsMock(1), undefined);
    expect(result.current.text).toEqual('Non operational');
    expect(result.current.intent).toEqual(Intent.Danger);
    expect(result.current.datanodeBlockHeight).toEqual(undefined);
    await waitFor(() => {
      expect(result.current.text).toEqual('Operational');
      expect(result.current.intent).toEqual(Intent.Success);
      expect(result.current.datanodeBlockHeight).toEqual(undefined);
    });
  });

  it('Warning latency', async () => {
    const now = 1678800900087;
    const headerTimestamp = now - 4000;
    const dateHeaderTimestamp = new Date(headerTimestamp);
    jest.useFakeTimers({ now });

    const { result } = setup(createStatsMock(2), {
      blockHeight: 2,
      timestamp: dateHeaderTimestamp,
    });
    await waitFor(() => {
      expect(result.current.text).toEqual('Warning delay ( >3 sec): 4.05 sec');
      expect(result.current.intent).toEqual(Intent.Warning);
      expect(result.current.datanodeBlockHeight).toEqual(2);
    });
  });

  it('Erroneous latency', async () => {
    const now = 1678800900087;
    const headerTimestamp = now - 11000;
    const dateHeaderTimestamp = new Date(headerTimestamp);
    jest.useFakeTimers({ now });

    const { result } = setup(createStatsMock(2), {
      blockHeight: 2,
      timestamp: dateHeaderTimestamp,
    });
    await waitFor(() => {
      expect(result.current.text).toEqual(
        'Erroneous latency ( >10 sec): 11.05 sec'
      );
      expect(result.current.intent).toEqual(Intent.Danger);
      expect(result.current.datanodeBlockHeight).toEqual(2);
    });
    jest.useRealTimers();
  });
});
