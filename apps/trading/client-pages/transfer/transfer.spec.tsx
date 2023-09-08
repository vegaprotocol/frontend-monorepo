import { act, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import { MemoryRouter } from 'react-router-dom';
import { Transfer } from './transfer';
import { useTransferAssetIdStore } from '@vegaprotocol/accounts';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';

const mockWalletContext = {} as unknown as VegaWalletContextShape;

let mockSearchParamsResult: string | undefined = undefined;
const mockSearchParams = {
  get: jest.fn(() => mockSearchParamsResult),
};
const mockSetSearchParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(() => [mockSearchParams, mockSetSearchParams]),
}));
jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  TransferContainer: jest.fn(({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  )),
}));

const renderJsx = () => {
  render(
    <VegaWalletContext.Provider value={mockWalletContext}>
      <MockedProvider>
        <MemoryRouter>
          <Transfer />
        </MemoryRouter>
      </MockedProvider>
    </VegaWalletContext.Provider>
  );
};

describe('Transfer page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('properly rendered', () => {
    renderJsx();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Transfer' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toBeEmptyDOMElement();
  });

  it('assetId should be passed down', async () => {
    mockSearchParamsResult = 'assetId';
    renderJsx();
    expect(screen.getByTestId('assetId')).toHaveTextContent('assetId');
  });

  it('fs store returns different assetId, search param should be cleared', async () => {
    mockSearchParamsResult = 'assetId';
    useTransferAssetIdStore.setState({ assetId: mockSearchParamsResult });
    renderJsx();
    expect(screen.getByTestId('assetId')).toHaveTextContent('assetId');
    expect(mockSetSearchParams).not.toHaveBeenCalled();
    act(() => {
      useTransferAssetIdStore.setState({ assetId: 'different-assetId' });
    });
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith({});
    });
  });
});
