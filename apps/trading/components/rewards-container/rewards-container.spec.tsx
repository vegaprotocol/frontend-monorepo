import { render, screen } from '@testing-library/react';
import type { Account } from '@vegaprotocol/accounts';
import { AccountType, AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { RewardPot, type RewardPotProps } from './rewards-container';

describe('VegaRewardPot', () => {
  const rewardAsset = {
    id: 'asset-1',
    symbol: 'ASSET 1',
    name: 'Asset 1',
    decimals: 2,
    quantum: '1',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20' as const,
      contractAddress: '0x123',
      lifetimeLimit: '100',
      withdrawThreshold: '100',
    },
  };

  const renderComponent = (props: RewardPotProps) => {
    return render(
      <MemoryRouter>
        <RewardPot {...props} />
      </MemoryRouter>
    );
  };

  it('Shows no rewards message if no accounts or vesting balances provided', () => {
    renderComponent({
      assetId: rewardAsset.id,
      accounts: [],
      vestingBalancesSummary: {
        lockedBalances: [],
        vestingBalances: [],
      },
    });

    expect(screen.getByText(/No rewards/)).toBeInTheDocument();
  });

  it('Calculates all the rewards', () => {
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
        asset: rewardAsset,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        balance: '100',
        asset: rewardAsset,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        balance: '50',
        asset: rewardAsset,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        balance: '500000',
        asset: asset2,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
        balance: '100',
        asset: rewardAsset,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
        balance: '2000000',
        asset: asset2,
      },
    ];

    const props = {
      assetId: rewardAsset.id,
      accounts: accounts,
      vestingBalancesSummary: {
        epoch: 1,
        lockedBalances: [
          {
            balance: '150',
            asset: rewardAsset,
            untilEpoch: 1,
          },
          {
            balance: '100',
            asset: rewardAsset,
            untilEpoch: 1,
          },
          {
            balance: '100',
            asset: asset2, // should be ignored
            untilEpoch: 1,
          },
        ],
        vestingBalances: [
          {
            balance: '250',
            asset: rewardAsset,
          },
          {
            balance: '200',
            asset: rewardAsset,
          },
          {
            balance: '100',
            asset: asset2, // should be ignored
          },
        ],
      },
    };

    renderComponent(props);

    expect(screen.getByTestId('total-rewards')).toHaveTextContent(
      `7.00 ${rewardAsset.symbol}`
    );

    expect(screen.getByText(/Locked/).nextElementSibling).toHaveTextContent(
      '2.50'
    );
    expect(screen.getByText(/Vesting/).nextElementSibling).toHaveTextContent(
      '4.50'
    );

    expect(
      screen.getByText(/Available to withdraw/).nextElementSibling
    ).toHaveTextContent('1.50');
  });
});
