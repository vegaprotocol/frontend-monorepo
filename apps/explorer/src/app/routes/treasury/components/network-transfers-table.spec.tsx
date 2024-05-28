import { AccountType } from '@vegaprotocol/types';
import {
  typeLabel,
  getToAccountTypeLabel,
  filterAccountTransfers,
} from './network-transfers-table';
import { render, screen } from '@testing-library/react';
import { NetworkTransfersTable } from './network-transfers-table';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import {
  ExplorerTreasuryTransfersDocument,
  type ExplorerTreasuryTransfersQuery,
} from '../__generated__/TreasuryTransfers';
import type { DeepPartial } from '@apollo/client/utilities';

describe('typeLabel', () => {
  it('should return "Transfer" for "OneOffTransfer" kind', () => {
    expect(typeLabel('OneOffTransfer')).toBe('Transfer - one time');
  });

  it('should return "Transfer" for "RecurringTransfer" kind', () => {
    expect(typeLabel('RecurringTransfer')).toBe('Transfer - repeating');
  });

  it('should return "Governance" for "OneOffGovernanceTransfer" kind', () => {
    expect(typeLabel('OneOffGovernanceTransfer')).toBe('Governance - one time');
  });

  it('should return "Governance" for "RecurringGovernanceTransfer" kind', () => {
    expect(typeLabel('RecurringGovernanceTransfer')).toBe(
      'Governance - repeating'
    );
  });

  it('should return "Unknown" for unknown kind', () => {
    expect(typeLabel()).toBe('Unknown');
    expect(typeLabel('')).toBe('Unknown');
    expect(typeLabel('InvalidKind')).toBe('Unknown');
  });
});

describe('getToAccountTypeLabel', () => {
  it('should return "Treasury" when type is ACCOUNT_TYPE_NETWORK_TREASURY', () => {
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_NETWORK_TREASURY)
    ).toBe('Treasury');
  });

  it('should return "Fees" when type is any of the fee account types', () => {
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE)
    ).toBe('Fees');
    expect(getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_FEES_MAKER)).toBe(
      'Fees'
    );
    expect(getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY)).toBe(
      'Fees'
    );
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_LP_LIQUIDITY_FEES)
    ).toBe('Fees');
    expect(
      getToAccountTypeLabel(
        AccountType.ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD
      )
    ).toBe('Fees');
  });

  it('should return "Insurance" when type is ACCOUNT_TYPE_GLOBAL_INSURANCE', () => {
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_GLOBAL_INSURANCE)
    ).toBe('Insurance');
  });

  it('should return "Rewards" when type is any of the reward account types', () => {
    expect(getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_GLOBAL_REWARD)).toBe(
      'Rewards'
    );
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY)
    ).toBe('Rewards');
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING)
    ).toBe('Rewards');
    expect(getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_VESTED_REWARDS)).toBe(
      'Rewards'
    );
    expect(
      getToAccountTypeLabel(AccountType.ACCOUNT_TYPE_VESTING_REWARDS)
    ).toBe('Rewards');
  });

  it('should return "Other" for any other type', () => {
    expect(getToAccountTypeLabel(undefined)).toBe('Other');
    expect(getToAccountTypeLabel('unknown' as AccountType)).toBe('Other');
  });
});

describe('filterAccountTransfers', () => {
  it('filters out transactions that are not to or from a treasury account', () => {
    const data: DeepPartial<ExplorerTreasuryTransfersQuery> = {
      transfersConnection: {
        edges: [
          {
            node: {
              transfer: {
                toAccountType: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
                fromAccountType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              },
            },
          },
          {
            node: {
              transfer: {
                toAccountType: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
                fromAccountType:
                  AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
              },
            },
          },
          {
            node: {
              transfer: {
                toAccountType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                fromAccountType: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
              },
            },
          },
          {
            node: {
              transfer: {
                toAccountType: AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
                fromAccountType:
                  AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
              },
            },
          },
        ],
      },
    };

    const result = filterAccountTransfers(
      data as ExplorerTreasuryTransfersQuery
    );

    expect(result).toHaveLength(3);
  });

  it('should return an empty array if no transfers match the filter', () => {
    const data: DeepPartial<ExplorerTreasuryTransfersQuery> = {
      transfersConnection: {
        edges: [
          {
            node: {
              transfer: {
                toAccountType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                fromAccountType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              },
            },
          },
          {
            node: {
              transfer: {
                toAccountType: AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
                fromAccountType:
                  AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
              },
            },
          },
        ],
      },
    };

    const result = filterAccountTransfers(
      data as ExplorerTreasuryTransfersQuery
    );

    expect(result).toHaveLength(0);
  });
});

jest.mock('../../../components/links');
jest.mock('../../../components/asset-balance/asset-balance');
jest.mock('../../../components/links/proposal-link/proposal-link');

describe('NetworkTransfersTable', () => {
  it('renders table headers correctly', async () => {
    const mocks = [
      {
        request: {
          query: ExplorerTreasuryTransfersDocument,
        },
        result: {
          data: {
            transfersConnection: {
              pageInfo: {
                hasNextPage: false,
              },
              edges: [
                {
                  node: {
                    transfer: {
                      id: '123',
                      toAccountType: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
                      fromAccountType:
                        AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
                      amount: '100',
                      asset: {
                        id: '1',
                      },
                      timestamp: '2022-01-01T00:00:00Z',
                      from: 'network',
                      to: '7100a8a82ef45adb9efa070cc821c6c5c48172d6dc5f842431549490fe5897a0',
                      reason: '',
                      status: 'COMPLETED',
                      kind: {
                        __typename: 'OneOffGovernanceTransfer',
                        deliverOn: '123',
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <MemoryRouter>
          <NetworkTransfersTable />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(await screen.findByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();

    expect(screen.getByTestId('to-account').textContent).toContain('7100');
    expect(screen.getByTestId('transfer-kind').textContent).toEqual(
      'Governance - one time'
    );
  });
});
