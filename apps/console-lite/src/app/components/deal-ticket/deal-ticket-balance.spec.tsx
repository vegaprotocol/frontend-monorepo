import React from 'react';
import { render } from '@testing-library/react';
import type {
  AccountFragment,
  DealTicketMarketFragment,
} from '@vegaprotocol/deal-ticket';
import { DealTicketBalance } from './deal-ticket-balance';
import { Schema } from '@vegaprotocol/types';

const tDAI: DealTicketMarketFragment['tradableInstrument']['instrument']['product']['settlementAsset'] =
  {
    __typename: 'Asset',
    id: '1',
    symbol: 'tDAI',
    name: 'TDAI',
    decimals: 2,
  };

const accounts: AccountFragment[] = [
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
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
