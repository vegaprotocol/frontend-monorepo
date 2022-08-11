import React from 'react';
import { render } from '@testing-library/react';
import type {
  PartyBalanceQuery_party_accounts,
  PartyBalanceQuery_party_accounts_asset,
} from './__generated__/PartyBalanceQuery';
import { DealTicketBalance } from './deal-ticket-balance';
import { AccountType } from '@vegaprotocol/types';

const tDAI: PartyBalanceQuery_party_accounts_asset = {
  __typename: 'Asset',
  id: '1',
  symbol: 'tDAI',
  name: 'TDAI',
  decimals: 2,
};

const accounts: PartyBalanceQuery_party_accounts[] = [
  {
    __typename: 'Account',
    type: AccountType.General,
    balance: '1000000',
    asset: tDAI,
  },
];

describe('DealTicketBalance', function () {
  it('should render the balance', () => {
    const { getByText, getByRole } = render(
      <DealTicketBalance
        settlementAsset={tDAI}
        accounts={accounts}
        isWalletConnected
      />
    );

    expect(getByRole('complementary')).toHaveAccessibleName('tDAI Balance');
    expect(getByText('10,000.00')).toBeInTheDocument();
    expect(getByText('tDAI')).toBeInTheDocument();
  });

  it('should prompt to connect wallet', () => {
    const { getByText } = render(
      <DealTicketBalance
        settlementAsset={tDAI}
        accounts={accounts}
        isWalletConnected={false}
      />
    );

    expect(
      getByText('Please connect your Vega wallet to see your balance')
    ).toBeInTheDocument();
  });

  it('should display zero balance', () => {
    const { getByText } = render(
      <DealTicketBalance
        settlementAsset={tDAI}
        accounts={[]}
        isWalletConnected={true}
      />
    );

    expect(getByText('No tDAI left to trade')).toBeInTheDocument();
  });
});
