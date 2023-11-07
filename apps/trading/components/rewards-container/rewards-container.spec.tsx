import { render, screen } from '@testing-library/react';
import type { Account } from '@vegaprotocol/accounts';
import { AccountType, AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { RewardPot } from './rewards-container';

describe('RewardPot', () => {
  it('Calculates the total and vesting reward pot using quantum', () => {
    const asset1 = {
      id: 'asset-1',
      symbol: 'ASSET 1',
      name: 'Asset 1',
      decimals: 0,
      quantum: '1',
      status: AssetStatus.STATUS_ENABLED,
      source: {
        __typename: 'ERC20' as const,
        contractAddress: '0x123',
        lifetimeLimit: '100',
        withdrawThreshold: '100',
      },
    };

    const asset2 = {
      id: 'asset-2',
      symbol: 'ASSET 2',
      name: 'Asset 2',
      decimals: 0,
      quantum: '1000000',
      status: AssetStatus.STATUS_ENABLED,
      source: {
        __typename: 'ERC20' as const,
        contractAddress: '0x123',
        lifetimeLimit: '100',
        withdrawThreshold: '100',
      },
    };
    const accounts: Account[] = [
      {
        type: AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '100',
        asset: asset1,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        balance: '100',
        asset: asset1,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        balance: '500000',
        asset: asset2,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
        balance: '100',
        asset: asset1,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
        balance: '2000000',
        asset: asset2,
      },
    ];
    render(
      <MemoryRouter>
        <RewardPot accounts={accounts} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('total-rewards')).toHaveTextContent('202.5 qUSD');
    expect(screen.getByTestId('available-rewards')).toHaveTextContent(
      '100.5 qUSD'
    );
  });
});
