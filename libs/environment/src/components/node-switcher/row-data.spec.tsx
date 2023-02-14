import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import { render, screen, waitFor } from '@testing-library/react';
import { RadioGroup } from '@vegaprotocol/ui-toolkit';
import type {
  BlockTimeSubscription,
  StatisticsQuery,
} from '../../utils/__generated__/Node';
import { BlockTimeDocument } from '../../utils/__generated__/Node';
import { StatisticsDocument } from '../../utils/__generated__/Node';
import type { RowDataProps } from './row-data';
import { BLOCK_THRESHOLD, RowData } from './row-data';
import type { HeaderEntry } from '@vegaprotocol/apollo-client';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { CUSTOM_NODE_KEY } from '../../types';

jest.mock('@vegaprotocol/apollo-client', () => ({
  useHeaderStore: jest.fn().mockReturnValue({}),
}));

const statsQueryMock: MockedResponse<StatisticsQuery> = {
  request: {
    query: StatisticsDocument,
  },
  result: {
    data: {
      statistics: {
        blockHeight: '1234',
        vegaTime: new Date().toISOString(),
        chainId: 'test-chain-id',
      },
    },
  },
};

const subMock: MockedResponse<BlockTimeSubscription> = {
  request: {
    query: BlockTimeDocument,
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

const mockHeaders = (
  url: string,
  headers: Partial<HeaderEntry> = {
    blockHeight: 100,
    timestamp: new Date(),
  }
) => {
  (useHeaderStore as unknown as jest.Mock).mockReturnValue({
    [url]: headers,
  });
};

const renderComponent = (
  props: RowDataProps,
  queryMock: MockedResponse<StatisticsQuery>,
  subMock: MockedResponse<BlockTimeSubscription>
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

describe('RowData', () => {
  const props = {
    id: '0',
    url: 'https://foo.bar.com',
    highestBlock: null,
    onBlockHeight: jest.fn(),
  };

  it('radio button enabled after stats query successful', async () => {
    mockHeaders(props.url);
    render(renderComponent(props, statsQueryMock, subMock));

    // radio should be disabled until query resolves
    expect(
      screen.getByRole('radio', {
        checked: false,
        name: props.url,
      })
    ).toBeDisabled();
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

  it('radio button disabled if query fails', async () => {
    mockHeaders(props.url, {});

    const failedQueryMock: MockedResponse<StatisticsQuery> = {
      request: {
        query: StatisticsDocument,
      },
      error: new Error('failed'),
    };

    const failedSubMock: MockedResponse<BlockTimeSubscription> = {
      request: {
        query: BlockTimeDocument,
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
    ).toBeDisabled();
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
      ).toBeDisabled();
    });
  });

  it('highlights rows with a slow block height', async () => {
    const blockHeight = 100;
    mockHeaders(props.url, { blockHeight });

    const { rerender } = render(
      renderComponent(
        { ...props, highestBlock: blockHeight + BLOCK_THRESHOLD },
        statsQueryMock,
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
        statsQueryMock,
        subMock
      )
    );

    expect(screen.getByTestId('block-height-cell')).toHaveClass('text-danger');
  });

  it('disables radio button if url is invalid', () => {
    mockHeaders(props.url, { blockHeight: 100 });

    render(renderComponent(props, statsQueryMock, subMock));

    expect(
      screen.getByRole('radio', {
        checked: false,
        name: props.url,
      })
    ).toBeDisabled();
  });

  it('doesnt render the radio if its the custom row', () => {
    render(
      renderComponent(
        {
          ...props,
          id: CUSTOM_NODE_KEY,
        },
        statsQueryMock,
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
    mockHeaders(props.url, { blockHeight });
    render(
      renderComponent(
        { ...props, onBlockHeight: mockOnBlockHeight },
        statsQueryMock,
        subMock
      )
    );

    expect(mockOnBlockHeight).toHaveBeenCalledWith(blockHeight);
  });
});
