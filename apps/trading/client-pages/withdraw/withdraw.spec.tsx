import { act, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { useWithdrawStore } from '@vegaprotocol/withdraws';
import { MemoryRouter } from 'react-router-dom';
import type { Asset } from '@vegaprotocol/assets';
import { Withdraw } from './withdraw';

const mockWalletContext = {} as unknown as VegaWalletContextShape;

jest.mock('../../components/withdraw-container', () => ({
  WithdrawContainer: jest.fn(({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  )),
}));

let mockSearchParamsResult: string | undefined = undefined;
const mockSearchParams = {
  get: jest.fn(() => mockSearchParamsResult),
};
const mockSetSearchParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(() => [mockSearchParams, mockSetSearchParams]),
}));

describe('Withdraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should be properly rendered', async () => {
    render(
      <VegaWalletContext.Provider value={mockWalletContext}>
        <MockedProvider>
          <MemoryRouter>
            <Withdraw />
          </MemoryRouter>
        </MockedProvider>
      </VegaWalletContext.Provider>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Withdraw' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toBeEmptyDOMElement();
  });

  it('assetId should be passed down', async () => {
    mockSearchParamsResult = 'assetId';
    render(
      <VegaWalletContext.Provider value={mockWalletContext}>
        <MockedProvider>
          <MemoryRouter>
            <Withdraw />
          </MemoryRouter>
        </MockedProvider>
      </VegaWalletContext.Provider>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Withdraw' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toHaveTextContent('assetId');
  });

  it('is store returns different asset, search param should be cleared', async () => {
    mockSearchParamsResult = 'assetId';
    render(
      <VegaWalletContext.Provider value={mockWalletContext}>
        <MockedProvider>
          <MemoryRouter>
            <Withdraw />
          </MemoryRouter>
        </MockedProvider>
      </VegaWalletContext.Provider>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Withdraw' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toHaveTextContent('assetId');
  });

  it('if store returns different asset, search param should be cleared', async () => {
    useWithdrawStore.setState({ asset: { id: 'assetId' } as unknown as Asset });
    mockSearchParamsResult = 'assetId';
    render(
      <VegaWalletContext.Provider value={mockWalletContext}>
        <MockedProvider>
          <MemoryRouter>
            <Withdraw />
          </MemoryRouter>
        </MockedProvider>
      </VegaWalletContext.Provider>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Withdraw' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toHaveTextContent('assetId');
    expect(mockSetSearchParams).not.toHaveBeenCalled();
    act(() => {
      useWithdrawStore.setState({
        asset: { id: 'different-assetId' } as unknown as Asset,
      });
    });
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith({});
    });
  });
});
