import { MockedProvider } from '@apollo/react-testing';
import { render, screen } from '@testing-library/react';
import { AssetStatus } from '@vegaprotocol/types';
import {
  AssetDetail,
  AssetDetailsDialog,
  testId,
} from './asset-details-dialog';
import type { AssetsFieldsFragment } from './__generated___/Assets';
import { AssetsDocument } from './__generated___/Assets';

const generateBuiltinAsset = (
  i: number,
  status: AssetStatus
): AssetsFieldsFragment => ({
  id: `B-0${i}`,
  name: `Builtin 0${i}`,
  symbol: `BIA0${i}`,
  decimals: 5,
  quantum: '1',
  source: {
    maxFaucetAmountMint: '5000000000',
    __typename: 'BuiltinAsset',
  },
  status: status,
  infrastructureFeeAccount: {
    balance: '0',
    __typename: 'Account',
  },
  globalRewardPoolAccount: null,
  takerFeeRewardAccount: null,
  makerFeeRewardAccount: null,
  lpFeeRewardAccount: null,
  marketProposerRewardAccount: null,
  __typename: 'Asset',
});

const mockedData = {
  data: {
    assetsConnection: {
      edges: [
        {
          node: {
            id: 'E-01',
            name: 'ERC20 01',
            symbol: 'EA01',
            decimals: 3,
            quantum: '1',
            source: {
              contractAddress: '0x123',
              lifetimeLimit: '123000000',
              withdrawThreshold: '50',
              __typename: 'ERC20',
            },
            status: AssetStatus.STATUS_ENABLED,
            infrastructureFeeAccount: {
              balance: '1',
              __typename: 'Account',
            },
            globalRewardPoolAccount: {
              balance: '2',
              __typename: 'Account',
            },
            takerFeeRewardAccount: {
              balance: '3',
              __typename: 'Account',
            },
            makerFeeRewardAccount: {
              balance: '4',
              __typename: 'Account',
            },
            lpFeeRewardAccount: {
              balance: '5',
              __typename: 'Account',
            },
            marketProposerRewardAccount: {
              balance: '6',
              __typename: 'Account',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(1, AssetStatus.STATUS_ENABLED),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(2, AssetStatus.STATUS_PENDING_LISTING),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(3, AssetStatus.STATUS_PROPOSED),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(4, AssetStatus.STATUS_REJECTED),
          __typename: 'AssetEdge',
        },
      ],
      __typename: 'AssetsConnection',
    },
  },
};

const mocks = [
  {
    request: {
      query: AssetsDocument,
      variables: {},
    },
    result: mockedData,
  },
];

const WrappedAssetDetailsDialog = ({
  assetSymbol,
}: {
  assetSymbol: string;
}) => (
  <MockedProvider mocks={mocks}>
    <AssetDetailsDialog
      assetSymbol={assetSymbol}
      open={true}
      onChange={() => false}
    ></AssetDetailsDialog>
  </MockedProvider>
);

describe('AssetDetailsDialog', () => {
  it('should show no data message given unknown asset symbol', async () => {
    render(<WrappedAssetDetailsDialog assetSymbol={'UNKNOWN_FOR_SURE'} />);
    expect((await screen.findByTestId('splash')).textContent).toContain(
      'No data'
    );
  });

  const cases: [string, { key: AssetDetail; value: string }[]][] = [
    [
      'EA01',
      [
        { key: AssetDetail.ID, value: 'E-01' },
        { key: AssetDetail.TYPE, value: 'ERC20' },
        { key: AssetDetail.NAME, value: 'ERC20 01' },
        { key: AssetDetail.SYMBOL, value: 'EA01' },
        { key: AssetDetail.DECIMALS, value: '3' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Enabled' },
        { key: AssetDetail.CONTRACT_ADDRESS, value: '0x123' },
        { key: AssetDetail.WITHDRAWAL_THRESHOLD, value: '0.050' },
        { key: AssetDetail.LIFETIME_LIMIT, value: '123,000.000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0.001',
        },
        {
          key: AssetDetail.GLOBAL_REWARD_POOL_ACCOUNT_BALANCE,
          value: '0.002',
        },
        { key: AssetDetail.TAKER_FEE_REWARD_ACCOUNT_BALANCE, value: '0.003' },
        { key: AssetDetail.MAKER_FEE_REWARD_ACCOUNT_BALANCE, value: '0.004' },
        { key: AssetDetail.LP_FEE_REWARD_ACCOUNT_BALANCE, value: '0.005' },
        {
          key: AssetDetail.MARKET_PROPOSER_REWARD_ACCOUNT_BALANCE,
          value: '0.006',
        },
      ],
    ],
    [
      'BIA01',
      [
        { key: AssetDetail.ID, value: 'B-01' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 01' },
        { key: AssetDetail.SYMBOL, value: 'BIA01' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Enabled' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000.00000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0.00000',
        },
      ],
    ],
    [
      'BIA02',
      [
        { key: AssetDetail.ID, value: 'B-02' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 02' },
        { key: AssetDetail.SYMBOL, value: 'BIA02' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Pending listing' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000.00000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0.00000',
        },
      ],
    ],
    [
      'BIA03',
      [
        { key: AssetDetail.ID, value: 'B-03' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 03' },
        { key: AssetDetail.SYMBOL, value: 'BIA03' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Proposed' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000.00000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0.00000',
        },
      ],
    ],
    [
      'BIA04',
      [
        { key: AssetDetail.ID, value: 'B-04' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 04' },
        { key: AssetDetail.SYMBOL, value: 'BIA04' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Rejected' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000.00000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0.00000',
        },
      ],
    ],
  ];
  it.each(cases)(
    'should show correct data given %p symbol',
    async (symbol, details) => {
      render(<WrappedAssetDetailsDialog assetSymbol={symbol} />);
      for (const detail of details) {
        expect(
          (await screen.findByTestId(testId(detail.key, 'value'))).textContent
        ).toContain(detail.value);
      }
    }
  );
});
