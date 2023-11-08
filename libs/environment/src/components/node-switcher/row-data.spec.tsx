import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { RadioGroup } from '@vegaprotocol/ui-toolkit';
import type {
  NodeCheckTimeUpdateSubscription,
  NodeCheckQuery,
} from '../../utils/__generated__/NodeCheck';
import {
  NodeCheckDocument,
  NodeCheckTimeUpdateDocument,
} from '../../utils/__generated__/NodeCheck';
import type { RowDataProps } from './row-data';
import {
  POLL_INTERVAL,
  Result,
  SUBSCRIPTION_TIMEOUT,
  useNodeBasicStatus,
  useNodeSubscriptionStatus,
  useResponseTime,
} from './row-data';
import { BLOCK_THRESHOLD, RowData } from './row-data';
import { CUSTOM_NODE_KEY } from '../../types';

const mockStatsQuery = (
  blockHeight = '1234'
): MockedResponse<NodeCheckQuery> => ({
  request: {
    query: NodeCheckDocument,
  },
  result: {
    data: {
      statistics: {
        blockHeight,
        vegaTime: new Date().toISOString(),
        chainId: 'test-chain-id',
      },
    },
  },
});

const subMock: MockedResponse<NodeCheckTimeUpdateSubscription> = {
  request: {
    query: NodeCheckTimeUpdateDocument,
  },
  result: {
    data: {
      busEvents: [
        {
          __typename: 'BusEvent',
          id: '123',
        },
      ],
    },
  },
};

const mockResponseTime = 50;
global.performance.getEntriesByName = jest.fn().mockReturnValue([
  {
    duration: mockResponseTime,
  },
]);

const renderComponent = (
  props: RowDataProps,
  queryMock: MockedResponse<NodeCheckQuery>,
  subMock: MockedResponse<NodeCheckTimeUpdateSubscription>
) => {
  return (
    <MockedProvider mocks={[queryMock, subMock, subMock, subMock]}>
      <RadioGroup>
        {/* Radio group required as radio is being render in isolation */}
        <RowData {...props} />
      </RadioGroup>
    </MockedProvider>
  );
};

describe('useNodeSubscriptionStatus', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  const mockWrapper =
    (withData = false) =>
    ({ children }: { children: React.ReactNode }) =>
      (
        <MockedProvider mocks={withData ? [subMock, subMock, subMock] : []}>
          {children}
        </MockedProvider>
      );
  it('results initially as loading', async () => {
    const { result } = renderHook(() => useNodeSubscriptionStatus(), {
      wrapper: mockWrapper(true),
    });
    expect(result.current.status).toBe(Result.Loading);
  });
  it('results as successful when data received', async () => {
    const { result } = renderHook(() => useNodeSubscriptionStatus(), {
      wrapper: mockWrapper(true),
    });
    expect(result.current.status).toBe(Result.Loading);
    await act(() => {
      jest.advanceTimersByTime(SUBSCRIPTION_TIMEOUT);
    });
    expect(result.current.status).toBe(Result.Successful);
  });
  it('result as failed when no data received', async () => {
    const { result } = renderHook(() => useNodeSubscriptionStatus(), {
      wrapper: mockWrapper(false),
    });
    expect(result.current.status).toBe(Result.Loading);
    await act(() => {
      jest.advanceTimersByTime(SUBSCRIPTION_TIMEOUT);
    });
    expect(result.current.status).toBe(Result.Failed);
  });
});

describe('useNodeBasicStatus', () => {
  const mockWrapper =
    (withData = false) =>
    ({ children }: { children: React.ReactNode }) =>
      (
        <MockedProvider mocks={withData ? [mockStatsQuery('1234')] : []}>
          {children}
        </MockedProvider>
      );
  it('results initially as loading', async () => {
    const { result } = renderHook(() => useNodeBasicStatus(), {
      wrapper: mockWrapper(true),
    });
    expect(result.current.status).toBe(Result.Loading);
    expect(result.current.currentBlockHeight).toBeNaN();
  });
  it('results as successful when data received', async () => {
    const { result } = renderHook(() => useNodeBasicStatus(), {
      wrapper: mockWrapper(true),
    });
    await waitFor(() => {
      expect(result.current.status).toBe(Result.Successful);
      expect(result.current.currentBlockHeight).toBe(1234);
    });
  });
  it('result as failed when no data received', async () => {
    const { result } = renderHook(() => useNodeBasicStatus(), {
      wrapper: mockWrapper(false),
    });
    await waitFor(() => {
      expect(result.current.status).toBe(Result.Failed);
      expect(result.current.currentBlockHeight).toBeNaN();
    });
  });
});

describe('useResponseTime', () => {
  it('returns response time when url is valid', () => {
    const { result } = renderHook(() =>
      useResponseTime('https://localhost:1234')
    );
    expect(result.current.responseTime).toBe(50);
  });
  it('does not return response time when url is invalid', () => {
    const { result } = renderHook(() => useResponseTime('nope'));
    expect(result.current.responseTime).toBeUndefined();
  });
});

describe('RowData', () => {
  const props = {
    id: '0',
    url: 'https://foo.bar.com',
    highestBlock: null,
    onBlockHeight: jest.fn(),
  };

  afterAll(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('radio button enabled after stats query successful', async () => {
    render(renderComponent(props, mockStatsQuery('100'), subMock));

    // radio should be enabled until query resolves
    expect(
      screen.getByRole('radio', {
        checked: false,
        name: props.url,
      })
    ).toBeEnabled();
    expect(screen.getByTestId('response-time-cell')).toHaveTextContent(
      'Checking'
    );
    expect(screen.getByTestId('block-height-cell')).toHaveTextContent(
      'Checking'
    );
    await waitFor(() => {
      expect(screen.getByTestId('block-height-cell')).toHaveTextContent('100');
      expect(screen.getByTestId('response-time-cell')).toHaveTextContent(
        mockResponseTime.toFixed(2) + 'ms'
      );
      expect(screen.getByTestId('subscription-cell')).toHaveTextContent('Yes');
      expect(
        screen.getByRole('radio', {
          checked: false,
          name: props.url,
        })
      ).toBeEnabled();
    });
  });

  it('radio button still enabled if query fails', async () => {
    const failedQueryMock: MockedResponse<NodeCheckQuery> = {
      request: {
        query: NodeCheckDocument,
      },
      error: new Error('failed'),
    };

    const failedSubMock: MockedResponse<NodeCheckTimeUpdateSubscription> = {
      request: {
        query: NodeCheckTimeUpdateDocument,
      },
      error: new Error('failed'),
    };

    render(renderComponent(props, failedQueryMock, failedSubMock));

    // radio should be disabled until query resolves
    expect(
      screen.getByRole('radio', {
        checked: false,
        name: props.url,
      })
    ).toBeEnabled();
    expect(screen.getByTestId('response-time-cell')).toHaveTextContent(
      'Checking'
    );
    expect(screen.getByTestId('block-height-cell')).toHaveTextContent(
      'Checking'
    );
    await waitFor(() => {
      const responseCell = screen.getByTestId('response-time-cell');
      const blockHeightCell = screen.getByTestId('block-height-cell');
      const subscriptionCell = screen.getByTestId('subscription-cell');
      expect(responseCell).toHaveTextContent('n/a');
      expect(responseCell).toHaveClass('text-danger');
      expect(blockHeightCell).toHaveTextContent('n/a');
      expect(blockHeightCell).toHaveClass('text-danger');
      expect(subscriptionCell).toHaveTextContent('No');
      expect(
        screen.getByRole('radio', {
          checked: false,
          name: props.url,
        })
      ).toBeEnabled();
    });
  });

  it('highlights rows with a slow block height', async () => {
    const blockHeight = 100;

    const { rerender } = render(
      renderComponent(
        { ...props, highestBlock: blockHeight + BLOCK_THRESHOLD },
        mockStatsQuery(String(blockHeight)),
        subMock
      )
    );

    await waitFor(() => {
      expect(screen.getByTestId('block-height-cell')).toHaveTextContent(
        blockHeight.toString()
      );
    });

    expect(screen.getByTestId('block-height-cell')).not.toHaveClass(
      'text-danger'
    );

    rerender(
      renderComponent(
        { ...props, highestBlock: blockHeight + BLOCK_THRESHOLD + 1 },
        mockStatsQuery(String(blockHeight)),
        subMock
      )
    );

    expect(screen.getByTestId('block-height-cell')).toHaveClass('text-danger');
  });

  it('doesnt render the radio if its the custom row', () => {
    render(
      renderComponent(
        {
          ...props,
          id: CUSTOM_NODE_KEY,
        },
        mockStatsQuery('1234'),
        subMock
      )
    );
    expect(
      screen.queryByRole('radio', {
        name: props.url,
      })
    ).not.toBeInTheDocument();
  });

  it('updates highest block after new header received', async () => {
    const mockOnBlockHeight = jest.fn();
    const blockHeight = 200;
    render(
      renderComponent(
        { ...props, onBlockHeight: mockOnBlockHeight },
        mockStatsQuery(String(blockHeight)),
        subMock
      )
    );

    await waitFor(() => {
      expect(mockOnBlockHeight).toHaveBeenCalledWith(blockHeight);
    });
  });

  it('should poll the query unless an errors is returned', async () => {
    jest.useFakeTimers();
    const createStatsQueryMock = (
      blockHeight: string
    ): MockedResponse<NodeCheckQuery> => {
      return {
        request: {
          query: NodeCheckDocument,
        },
        result: {
          data: {
            statistics: {
              blockHeight,
              vegaTime: new Date().toISOString(),
              chainId: 'test-chain-id',
            },
          },
        },
      };
    };

    const createFailedStatsQueryMock = (): MockedResponse<NodeCheckQuery> => {
      return {
        request: {
          query: NodeCheckDocument,
        },
        result: {
          data: undefined,
        },
        error: new Error('failed'),
      };
    };

    const statsQueryMock1 = createStatsQueryMock('1234');
    const statsQueryMock2 = createStatsQueryMock('1235');
    const statsQueryMock3 = createFailedStatsQueryMock();
    const statsQueryMock4 = createStatsQueryMock('1236');
    render(
      <MockedProvider
        mocks={[
          statsQueryMock1,
          statsQueryMock2,
          statsQueryMock3,
          statsQueryMock4,
          subMock,
        ]}
      >
        <RadioGroup>
          {/* Radio group required as radio is being render in isolation */}
          <RowData {...props} />
        </RadioGroup>
      </MockedProvider>
    );

    expect(screen.getByTestId('block-height-cell')).toHaveTextContent(
      'Checking'
    );

    // statsQueryMock1 should be rendered
    await waitFor(() => {
      const elem = screen.getByTestId('query-block-height');
      expect(elem).toHaveAttribute('data-query-block-height', '1234');
    });

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL);
    });

    // statsQueryMock2 should be rendered
    await waitFor(() => {
      const elem = screen.getByTestId('query-block-height');
      expect(elem).toHaveAttribute('data-query-block-height', '1235');
    });

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL);
    });

    // statsQueryMock3 should FAIL!
    await waitFor(() => {
      const elem = screen.getByTestId('query-block-height');
      expect(elem).toHaveAttribute('data-query-block-height', 'failed');
    });

    // run the timer again, but statsQueryMock4's result should not be
    // rendered even though its successful, because the poll
    // should have been stopped
    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL);
    });

    // should still render the result of statsQueryMock3
    await waitFor(() => {
      const elem = screen.getByTestId('query-block-height');
      expect(elem).toHaveAttribute('data-query-block-height', 'failed');
    });

    jest.useRealTimers();
  });
});
