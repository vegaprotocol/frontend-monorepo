import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { MarketDealTicketAsset } from '@vegaprotocol/market-list';
import { DealTicketBalance } from './deal-ticket-balance';

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn().mockReturnValue('wallet-pub-key'),
}));

const tDAI: MarketDealTicketAsset = {
  __typename: 'Asset',
  id: '1',
  symbol: 'tDAI',
  name: 'TDAI',
  decimals: 2,
};

let mockAccountBalance: {
  accountBalance: string;
  accountDecimals: number | null;
} = { accountBalance: '1000000', accountDecimals: 2 };
jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useAccountBalance: jest.fn(() => mockAccountBalance),
}));

describe('DealTicketBalance', function () {
  it('should render the balance', () => {
    const { getByText, getByRole } = render(
      <DealTicketBalance settlementAsset={tDAI} isWalletConnected />,
      { wrapper: MockedProvider }
    );

    expect(getByRole('complementary')).toHaveAccessibleName('tDAI Balance');
    expect(getByText('10,000.00')).toBeInTheDocument();
    expect(getByText('tDAI')).toBeInTheDocument();
  });

  it('should prompt to connect wallet', () => {
    const { getByText } = render(
      <DealTicketBalance settlementAsset={tDAI} isWalletConnected={false} />,
      { wrapper: MockedProvider }
    );

    expect(
      getByText('Please connect your Vega wallet to see your balance')
    ).toBeInTheDocument();
  });

  it('should display zero balance', () => {
    mockAccountBalance = { accountBalance: '', accountDecimals: null };
    const { getByText } = render(
      <DealTicketBalance settlementAsset={tDAI} isWalletConnected={true} />,
      { wrapper: MockedProvider }
    );

    expect(getByText('No tDAI left to trade')).toBeInTheDocument();
  });
});
