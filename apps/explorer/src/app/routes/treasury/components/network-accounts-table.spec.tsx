import type { DeepPartial } from '@apollo/client/utilities';
import { parseResultsToAccounts } from './network-accounts-table';
import {
  ExplorerTreasuryDocument,
  type ExplorerTreasuryQuery,
} from '../__generated__/Treasury';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { NetworkAccountsTable } from './network-accounts-table';

describe('parseResultsToAccounts', () => {
  it('should return an array of non-zero treasury accounts', () => {
    const data: DeepPartial<ExplorerTreasuryQuery> = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: 'asset1',
              networkTreasuryAccount: {
                balance: '100',
              },
            },
          },
          {
            node: {
              id: 'has0assets',
              networkTreasuryAccount: {
                balance: '0',
              },
            },
          },
          {
            node: {
              id: 'asset3',
              networkTreasuryAccount: {
                balance: '50',
              },
            },
          },
          {
            node: {
              id: 'hasnonetworktreasuryaccount',
            },
          },
        ],
      },
    };

    const result = parseResultsToAccounts(data as ExplorerTreasuryQuery);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        assetId: 'asset1',
        balance: '100',
        type: 'ACCOUNT_TYPE_NETWORK_TREASURY',
      },
      {
        assetId: 'asset3',
        balance: '50',
        type: 'ACCOUNT_TYPE_NETWORK_TREASURY',
      },
    ]);
  });

  it('should return an empty array if no non-zero accounts are found', () => {
    const data: DeepPartial<ExplorerTreasuryQuery> = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: 'asset1',
              networkTreasuryAccount: {
                balance: '0',
              },
            },
          },
          {
            node: {
              id: 'asset2',
              networkTreasuryAccount: {
                balance: '0',
              },
            },
          },
        ],
      },
    };

    const result = parseResultsToAccounts(data as ExplorerTreasuryQuery);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle missing data', () => {
    const result = parseResultsToAccounts(
      undefined as unknown as ExplorerTreasuryQuery
    );

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

jest.mock('../../../components/links');
jest.mock('../../../components/asset-balance/asset-balance');

describe('NetworkAccountsTable', () => {
  const mockData: ExplorerTreasuryQuery = {
    assetsConnection: {
      edges: [
        {
          node: {
            id: 'asset1',
            networkTreasuryAccount: {
              balance: '100',
            },
          },
        },
        {
          node: {
            id: 'asset2',
            networkTreasuryAccount: {
              balance: '50',
            },
          },
        },
      ],
    },
  };

  const mocks = [
    {
      request: {
        query: ExplorerTreasuryDocument,
      },
      result: {
        data: mockData,
      },
    },
  ];

  it('should render network accounts (as many as match - often just 1)', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <NetworkAccountsTable />
        </MemoryRouter>
      </MockedProvider>
    );

    // Wait for the data to load
    await screen.findByText('Loading...');

    // Assert that the network accounts are rendered
    expect(screen.getByText('asset1')).toBeInTheDocument();
    expect(screen.getByText('asset2')).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <NetworkAccountsTable />
        </MemoryRouter>
      </MockedProvider>
    );

    // Assert that the loading state is rendered
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
