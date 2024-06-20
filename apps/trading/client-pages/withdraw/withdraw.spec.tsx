import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { MockedWalletProvider } from '@vegaprotocol/wallet-react/testing';

import { Withdraw } from './withdraw';

jest.mock('../../components/withdraw-container', () => ({
  WithdrawContainer: ({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  ),
}));

const renderJsx = (route = '/withdraw') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <MockedWalletProvider>
        <Withdraw />
      </MockedWalletProvider>
    </MemoryRouter>
  );
};

describe('Withdraw page', () => {
  it('assetId should be passed down', () => {
    const assetId = 'foo';
    const route = '/withdraw?assetId=' + assetId;
    renderJsx(route);
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
