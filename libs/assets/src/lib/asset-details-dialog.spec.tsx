import { MockedProvider } from '@apollo/react-testing';
import { render, screen } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import { AssetDetailsDialog } from './asset-details-dialog';
import { AssetDetail, testId } from './asset-details-table';
import { AssetDocument } from './__generated__/Asset';
import { generateBuiltinAsset, generateERC20Asset } from './test-helpers';

const mockedData = {
  data: {
    assetsConnection: {
      edges: [
        {
          node: generateERC20Asset(1, Schema.AssetStatus.STATUS_ENABLED),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(1, Schema.AssetStatus.STATUS_ENABLED),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(
            2,
            Schema.AssetStatus.STATUS_PENDING_LISTING
          ),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(3, Schema.AssetStatus.STATUS_PROPOSED),
          __typename: 'AssetEdge',
        },
        {
          node: generateBuiltinAsset(4, Schema.AssetStatus.STATUS_REJECTED),
          __typename: 'AssetEdge',
        },
      ],
      __typename: 'AssetsConnection',
    },
  },
};

const mocks = mockedData.data.assetsConnection.edges.map((mock) => ({
  request: {
    query: AssetDocument,
    variables: { assetId: mock.node.id },
  },
  result: {
    data: {
      assetsConnection: { edges: [mock] },
    },
  },
}));

const WrappedAssetDetailsDialog = ({ assetId }: { assetId: string }) => (
  <MockedProvider mocks={mocks}>
    <AssetDetailsDialog
      assetId={assetId}
      open={true}
      onChange={() => false}
    ></AssetDetailsDialog>
  </MockedProvider>
);

describe('AssetDetailsDialog', () => {
  // 7001-COLL-008
  // 6501-ASSE-001
  // 6501-ASSE-002
  // 6501-ASSE-003
  // 6501-ASSE-004
  // 6501-ASSE-005
  // 6501-ASSE-006
  // 6501-ASSE-007
  // 6501-ASSE-008
  // 6501-ASSE-009
  // 6501-ASSE-010
  // 6501-ASSE-011
  // 6501-ASSE-012
  // 6501-ASSE-013
  it('should show no data message given unknown asset symbol', async () => {
    render(<WrappedAssetDetailsDialog assetId={'UNKNOWN_FOR_SURE'} />);
    expect((await screen.findByTestId('splash')).textContent).toContain(
      'No data'
    );
  });

  const cases: [
    string, // generated asset id
    { key: AssetDetail; value: string }[]
  ][] = [
    [
      'E-01',
      [
        { key: AssetDetail.ID, value: 'E-01' },
        { key: AssetDetail.TYPE, value: 'ERC20' },
        { key: AssetDetail.NAME, value: 'ERC20 01' },
        { key: AssetDetail.SYMBOL, value: 'EA01' },
        { key: AssetDetail.DECIMALS, value: '3' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Enabled' },
        { key: AssetDetail.CONTRACT_ADDRESS, value: '0x123' },
        { key: AssetDetail.WITHDRAWAL_THRESHOLD, value: '0.05' },
        { key: AssetDetail.LIFETIME_LIMIT, value: '123,000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0.001',
        },
        {
          key: AssetDetail.GLOBAL_REWARD_POOL_ACCOUNT_BALANCE,
          value: '0.002',
        },
        { key: AssetDetail.MAKER_PAID_FEES_ACCOUNT_BALANCE, value: '0.003' },
        {
          key: AssetDetail.MAKER_RECEIVED_FEES_ACCOUNT_BALANCE,
          value: '0.004',
        },
        { key: AssetDetail.LP_FEE_REWARD_ACCOUNT_BALANCE, value: '0.005' },
        {
          key: AssetDetail.MARKET_PROPOSER_REWARD_ACCOUNT_BALANCE,
          value: '0.006',
        },
      ],
    ],
    [
      'B-01',
      [
        { key: AssetDetail.ID, value: 'B-01' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 01' },
        { key: AssetDetail.SYMBOL, value: 'BIA01' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Enabled' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0',
        },
      ],
    ],
    [
      'B-02',
      [
        { key: AssetDetail.ID, value: 'B-02' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 02' },
        { key: AssetDetail.SYMBOL, value: 'BIA02' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Pending listing' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0',
        },
      ],
    ],
    [
      'B-03',
      [
        { key: AssetDetail.ID, value: 'B-03' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 03' },
        { key: AssetDetail.SYMBOL, value: 'BIA03' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Proposed' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0',
        },
      ],
    ],
    [
      'B-04',
      [
        { key: AssetDetail.ID, value: 'B-04' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 04' },
        { key: AssetDetail.SYMBOL, value: 'BIA04' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Rejected' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000' },
        {
          key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
          value: '0',
        },
      ],
    ],
  ];

  it.each(cases)(
    'should show correct data given %p id',
    async (id, details) => {
      render(<WrappedAssetDetailsDialog assetId={id} />);
      for (const detail of details) {
        expect(
          (await screen.findByTestId(testId(detail.key, 'value'))).textContent
        ).toContain(detail.value);
      }
    }
  );
});
