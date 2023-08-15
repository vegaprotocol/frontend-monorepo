import { render, screen, act, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import type { Market } from '@vegaprotocol/markets';
import { SuccessorMarketRenderer } from './successor-market-cell';
import {
  MarketsDocument,
  SuccessorMarketIdsDocument,
} from '@vegaprotocol/markets';
import { createMarketFragment } from '@vegaprotocol/mock';

const mockSuccessorsQuery = [
  {
    id: 'market1',
    parentMarketID: 'parentMarket1',
    successorMarketID: 'successorMarket1',
  },
  { id: 'market2', parentMarketID: 'parentMarket2' },
  { id: 'market3', successorMarketID: 'successorMarket3' },
];
const parentMarket1 = {
  id: 'parentMarket1',
  tradableInstrument: {
    instrument: { code: 'code parent 1', id: '1' },
  },
} as unknown as Market;
const successorMarket1 = {
  id: 'successorMarket1',
  tradableInstrument: {
    instrument: { code: 'code successor 1', id: '2' },
  },
} as unknown as Market;
const parentMarket2 = {
  id: 'parentMarket2',
  tradableInstrument: {
    instrument: { code: 'code parent 2', id: '3' },
  },
} as unknown as Market;
const successorMarket3 = {
  id: 'successorMarket3',
  tradableInstrument: {
    instrument: { code: 'code successor 3', id: '4' },
  },
} as unknown as Market;

const mockMarkets = [
  parentMarket1,
  successorMarket1,
  parentMarket2,
  successorMarket3,
];

const mockClickHandler = jest.fn();
jest.mock('../../lib/hooks/use-market-click-handler', () => ({
  useMarketClickHandler: jest.fn().mockImplementation(() => mockClickHandler),
}));

const marketMock = {
  request: {
    query: MarketsDocument,
    variables: undefined,
  },
  result: {
    data: {
      marketsConnection: {
        edges: mockMarkets.map((item) => ({
          node: {
            ...createMarketFragment(item),
          },
        })),
      },
    },
  },
};

const successorMock = {
  request: {
    query: SuccessorMarketIdsDocument,
  },
  result: {
    data: {
      marketsConnection: {
        edges: mockSuccessorsQuery.map((item) => ({
          node: {
            ...item,
          },
        })),
      },
    },
  },
};

const mocks = [marketMock, successorMock];

describe('SuccessorMarketRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should properly rendered successor market', async () => {
    const successorValue = 'market1';
    render(
      <MockedProvider mocks={[...mocks]}>
        <SuccessorMarketRenderer value={successorValue} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('market-code')).toBeInTheDocument();
    });
    expect(screen.getByText('code successor 1')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('successorMarket1', false);
    });
  });
  it('should properly rendered parent market', async () => {
    const successorValue = 'market1';
    render(
      <MockedProvider mocks={[...mocks]}>
        <SuccessorMarketRenderer value={successorValue} parent />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('market-code')).toBeInTheDocument();
    });
    expect(screen.getByText('code parent 1')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('parentMarket1', false);
    });
  });
  it('should properly rendered only parent market', async () => {
    const successorValue = 'market2';
    const { rerender } = render(
      <MockedProvider mocks={[...mocks]}>
        <SuccessorMarketRenderer value={successorValue} parent />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('market-code')).toBeInTheDocument();
    });
    expect(screen.getByText('code parent 2')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('parentMarket2', false);
    });

    rerender(
      <MockedProvider mocks={[...mocks]}>
        <SuccessorMarketRenderer value={successorValue} />
      </MockedProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('should properly rendered only successor market', async () => {
    const successorValue = 'market3';
    const { rerender } = render(
      <MockedProvider mocks={[...mocks]}>
        <SuccessorMarketRenderer value={successorValue} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('market-code')).toBeInTheDocument();
    });
    expect(screen.getByText('code successor 3')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('successorMarket3', false);
    });

    await act(() => {
      rerender(
        <MockedProvider mocks={[...mocks]}>
          <SuccessorMarketRenderer value={successorValue} parent />
        </MockedProvider>
      );
    });
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
