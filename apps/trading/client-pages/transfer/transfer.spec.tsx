import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { MockedWalletProvider } from '@vegaprotocol/wallet-react/testing';

import { Transfer } from './transfer';

jest.mock('@vegaprotocol/accounts', () => ({
  TransferContainer: ({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  ),
}));

const renderJsx = (route = '/transfer') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <MockedWalletProvider>
        <Transfer />
      </MockedWalletProvider>
    </MemoryRouter>
  );
};

describe('Transfer page', () => {
  it('assetId should be passed down', () => {
    const assetId = 'foo';
    const route = '/transfer?assetId=' + assetId;
    renderJsx(route);
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
