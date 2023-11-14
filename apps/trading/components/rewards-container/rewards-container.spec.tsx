import { render, screen } from '@testing-library/react';
import type { Account } from '@vegaprotocol/accounts';
import { AccountType, AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { RewardPot, Vesting, type RewardPotProps } from './rewards-container';
import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import { type AssetQuery, AssetDocument } from '@vegaprotocol/assets';

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

describe('RewardPot', () => {
  const renderComponent = (props: RewardPotProps) => {
    return render(
      <MemoryRouter>
        <RewardPot {...props} />
      </MemoryRouter>
    );
  };

  it('Shows no rewards message if no accounts or vesting balances provided', () => {
    renderComponent({
      pubKey: 'pubkey',
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
        type: AccountType.ACCOUNT_TYPE_VESTING_REWARDS, // should be ignored as its vesting
        balance: '100',
        asset: rewardAsset,
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTING_REWARDS, // should be ignored
        balance: '2000000',
        asset: asset2,
      },
    ];

    const props = {
      pubKey: 'pubkey',
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

describe('Vesting', () => {
  it('renders vesting rates', async () => {
    const assetMock: MockedResponse<AssetQuery> = {
      request: {
        query: AssetDocument,
        variables: {
          assetId: rewardAsset.id,
        },
      },
      result: {
        data: {
          assetsConnection: {
            edges: [
              {
                node: rewardAsset,
              },
            ],
          },
        },
      },
    };
    render(
      <MockedProvider mocks={[assetMock]}>
        <Vesting
          assetId={rewardAsset.id}
          baseRate={'0.25'}
          pubKey="pubKey"
          multiplier="2"
          vestingBalancesSummary={{
            epoch: 5,
            lockedBalances: [
              {
                balance: '150',
                asset: rewardAsset,
                untilEpoch: 6,
              },
              {
                balance: '100',
                asset: rewardAsset,
                untilEpoch: 6,
              },
              {
                balance: '100',
                asset: rewardAsset,
                untilEpoch: 7,
              },
            ],
          }}
          epoch={5}
        />
      </MockedProvider>
    );

    const computedRate = await screen.findByTestId('vesting-rate');
    expect(computedRate).toHaveTextContent('50%');

    const baseRateLabel = screen.getByText(/Base rate/);
    expect(baseRateLabel.nextElementSibling).toHaveTextContent('25%');

    const nextEpochLabel = screen.getByText('Available to withdraw next epoch');
    expect(nextEpochLabel.nextElementSibling).toHaveTextContent('2.50');
  });
});
