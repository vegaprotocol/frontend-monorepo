import { render, screen, act, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import type { Market } from '@vegaprotocol/markets';
import { SuccessorMarketRenderer } from './successor-market-cell';

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
    instrument: { code: 'code parent 1', product: { __typename: 'Future' } },
  },
} as unknown as Market;
const successorMarket1 = {
  id: 'successorMarket1',
  tradableInstrument: {
    instrument: { code: 'code successor 1', product: { __typename: 'Future' } },
  },
} as unknown as Market;
const parentMarket2 = {
  id: 'parentMarket2',
  tradableInstrument: {
    instrument: { code: 'code parent 2', product: { __typename: 'Future' } },
  },
} as unknown as Market;
const successorMarket3 = {
  id: 'successorMarket3',
  tradableInstrument: {
    instrument: { code: 'code successor 3', product: { __typename: 'Future' } },
  },
} as unknown as Market;

const mockMarkets: { [key in string]: Market } = {
  parentMarket1,
  successorMarket1,
  parentMarket2,
  successorMarket3,
};
jest.mock('@vegaprotocol/markets', () => ({
  ...jest.requireActual('@vegaprotocol/markets'),
  useSuccessorMarketIds: jest
    .fn()
    .mockImplementation((id) =>
      mockSuccessorsQuery.find((item) => item.id === id)
    ),
}));

jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn().mockImplementation((args) => {
    const { marketId } = args.variables;
    return { data: mockMarkets[marketId] || null, error: null };
  }),
}));

const mockClickHandler = jest.fn();
jest.mock('../../lib/hooks/use-market-click-handler', () => ({
  useMarketClickHandler: jest.fn().mockImplementation(() => mockClickHandler),
}));

describe('SuccessorMarketRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should properly rendered successor market', async () => {
    const successorValue = 'market1';
    render(
      <MockedProvider>
        <SuccessorMarketRenderer value={successorValue} />
      </MockedProvider>
    );
    expect(screen.getByTestId('market-code')).toBeInTheDocument();
    expect(screen.getByText('code successor 1')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();
    await act(() => {
      userEvent.click(screen.getByRole('button'));
    });
    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('successorMarket1', false);
    });
  });
  it('should properly rendered parent market', async () => {
    const successorValue = 'market1';
    render(
      <MockedProvider>
        <SuccessorMarketRenderer value={successorValue} parent />
      </MockedProvider>
    );
    expect(screen.getByTestId('market-code')).toBeInTheDocument();
    expect(screen.getByText('code parent 1')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();
    await act(() => {
      userEvent.click(screen.getByRole('button'));
    });
    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('parentMarket1', false);
    });
  });
  it('should properly rendered only parent market', async () => {
    const successorValue = 'market2';
    const { rerender } = render(
      <MockedProvider>
        <SuccessorMarketRenderer value={successorValue} parent />
      </MockedProvider>
    );
    expect(screen.getByTestId('market-code')).toBeInTheDocument();
    expect(screen.getByText('code parent 2')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();
    await act(() => {
      userEvent.click(screen.getByRole('button'));
    });
    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('parentMarket2', false);
    });

    rerender(
      <MockedProvider>
        <SuccessorMarketRenderer value={successorValue} />
      </MockedProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('should properly rendered only successor market', async () => {
    const successorValue = 'market3';
    const { rerender } = render(
      <MockedProvider>
        <SuccessorMarketRenderer value={successorValue} />
      </MockedProvider>
    );
    expect(screen.getByTestId('market-code')).toBeInTheDocument();
    expect(screen.getByText('code successor 3')).toBeInTheDocument();
    expect(screen.getByText('Futr')).toBeInTheDocument();
    await act(() => {
      userEvent.click(screen.getByRole('button'));
    });
    await waitFor(() => {
      expect(mockClickHandler).toHaveBeenCalledWith('successorMarket3', false);
    });

    await act(() => {
      rerender(
        <MockedProvider>
          <SuccessorMarketRenderer value={successorValue} parent />
        </MockedProvider>
      );
    });
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
