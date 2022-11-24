import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { Account } from '@vegaprotocol/accounts';
import { WithdrawFormContainer } from './withdraw-form-container';
import { Schema as Types } from '@vegaprotocol/types';
import { useWeb3React } from '@web3-react/core';
let mockData: Account[] | null = null;
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: () => ({
    data: mockData,
  }),
}));
jest.mock('@web3-react/core');

describe('WithdrawFormContainer', () => {
  const props = {
    submit: jest.fn(),
    assetId: 'assetId',
    partyId: 'partyId',
  };
  const MOCK_ETH_ADDRESS = '0xcool';

  const account1: Account = {
    type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '200099689',
    market: null,
    asset: {
      id: 'assetId-1',
      name: 'tBTC TEST',
      symbol: 'tBTC',
      decimals: 5,
      quantum: '1',
      source: {
        __typename: 'ERC20',
        contractAddress: '0x1d525fB145Af5c51766a89706C09fE07E6058D1D',
        lifetimeLimit: '0',
        withdrawThreshold: '0',
      },
      status: Types.AssetStatus.STATUS_ENABLED,
      infrastructureFeeAccount: {
        balance: '1',
        __typename: 'AccountBalance',
      },
      globalRewardPoolAccount: {
        balance: '1',
        __typename: 'AccountBalance',
      },
      takerFeeRewardAccount: null,
      makerFeeRewardAccount: null,
      lpFeeRewardAccount: null,
      marketProposerRewardAccount: null,
      __typename: 'Asset',
    },
    __typename: 'AccountBalance',
  };

  const account2: Account = {
    type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '199994240',
    market: null,
    asset: {
      id: 'assetId-2',
      name: 'tUSDC TEST',
      symbol: 'tUSDC',
      decimals: 5,
      quantum: '1',
      source: {
        __typename: 'ERC20',
        contractAddress: '0xdBa6373d0DAAAA44bfAd663Ff93B1bF34cE054E9',
        lifetimeLimit: '0',
        withdrawThreshold: '0',
      },
      status: Types.AssetStatus.STATUS_ENABLED,
      infrastructureFeeAccount: {
        balance: '2',
        __typename: 'AccountBalance',
      },
      globalRewardPoolAccount: {
        balance: '0',
        __typename: 'AccountBalance',
      },
      takerFeeRewardAccount: null,
      makerFeeRewardAccount: null,
      lpFeeRewardAccount: null,
      marketProposerRewardAccount: null,
      __typename: 'Asset',
    },
    __typename: 'AccountBalance',
  };

  beforeEach(() => {
    (useWeb3React as jest.Mock).mockReturnValue({ account: MOCK_ETH_ADDRESS });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should be properly rendered', () => {
    mockData = [
      { ...account1 },
      { ...account2 },
      {
        type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
        balance: '201159',
        market: {
          __typename: 'Market',
          id: 'marketId-1',
          decimalPlaces: 5,
          positionDecimalPlaces: 0,
          state: Types.MarketState.STATE_SUSPENDED,
          tradingMode: Types.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
          fees: {
            __typename: 'Fees',
            factors: {
              __typename: 'FeeFactors',
              makerFee: '0.0002',
              infrastructureFee: '0.0005',
              liquidityFee: '0.001',
            },
          },
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'Apple Monthly (Nov 2022)',
              code: 'AAPL.MF21',
              metadata: {
                __typename: 'InstrumentMetadata',
                tags: [
                  'formerly:4899E01009F1A721',
                  'quote:USD',
                  'ticker:AAPL',
                  'class:equities/single-stock-futures',
                  'sector:tech',
                  'listing_venue:NASDAQ',
                  'country:US',
                  'auto:aapl',
                ],
              },
              product: {
                __typename: 'Future',
                settlementAsset: {
                  __typename: 'Asset',
                  id: 'asset-id',
                  symbol: 'tUSDC',
                  decimals: 5,
                },
                quoteName: 'USD',
              },
            },
          },
          marketTimestamps: {
            __typename: 'MarketTimestamps',
            open: '2022-10-25T18:17:59.149283671Z',
            close: null,
          },
        },
        asset: {
          id: 'assetId-2',
          name: 'tUSDC TEST',
          symbol: 'tUSDC',
          decimals: 5,
          quantum: '1',
          source: {
            __typename: 'ERC20',
            contractAddress: '0xdBa6373d0DAAAA44bfAd663Ff93B1bF34cE054E9',
            lifetimeLimit: '0',
            withdrawThreshold: '0',
          },
          status: Types.AssetStatus.STATUS_ENABLED,
          infrastructureFeeAccount: {
            balance: '2',
            __typename: 'AccountBalance',
          },
          globalRewardPoolAccount: {
            balance: '0',
            __typename: 'AccountBalance',
          },
          takerFeeRewardAccount: null,
          makerFeeRewardAccount: null,
          lpFeeRewardAccount: null,
          marketProposerRewardAccount: null,
          __typename: 'Asset',
        },
        __typename: 'AccountBalance',
      },
    ];
    render(
      <MockedProvider>
        <WithdrawFormContainer {...props} />
      </MockedProvider>
    );
    expect(screen.getByTestId('select-asset')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('should display no data message', () => {
    mockData = null;
    render(
      <MockedProvider>
        <WithdrawFormContainer {...props} />
      </MockedProvider>
    );
    expect(
      screen.getByText('You have no assets to withdraw')
    ).toBeInTheDocument();
  });

  it('should filter out zero balance account assets', () => {
    mockData = [{ ...account1 }, { ...account2, balance: '0' }];
    render(
      <MockedProvider>
        <WithdrawFormContainer {...props} />
      </MockedProvider>
    );
    expect(screen.getByTestId('select-asset')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('when no accounts have a balance should should display no data message', () => {
    mockData = [
      { ...account1, balance: '0' },
      { ...account2, balance: '0' },
    ];
    render(
      <MockedProvider>
        <WithdrawFormContainer {...props} />
      </MockedProvider>
    );
    expect(
      screen.getByText('You have no assets to withdraw')
    ).toBeInTheDocument();
  });
});
