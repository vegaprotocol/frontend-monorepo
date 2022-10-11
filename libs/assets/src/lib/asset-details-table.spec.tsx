import { render, screen } from '@testing-library/react';
import { AssetStatus } from '@vegaprotocol/types';
import type { Asset } from './asset-data-provider';
import {
  AssetDetail,
  AssetDetailsTable,
  rows,
  testId,
} from './asset-details-table';
import { generateBuiltinAsset, generateERC20Asset } from './test-helpers';

describe('AssetDetailsTable', () => {
  const cases: [string, Asset, { key: AssetDetail; value: string }[]][] = [
    [
      'ERC20 asset',
      generateERC20Asset(1, AssetStatus.STATUS_ENABLED),
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
      'Builtin asset',
      generateBuiltinAsset(1, AssetStatus.STATUS_ENABLED),
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
  ];
  it.each(cases)(
    "displays the available asset's data of %p with correct labels",
    async (_type, asset, details) => {
      render(<AssetDetailsTable asset={asset} />);
      for (const detail of details) {
        expect(
          await (
            await screen.findByTestId(testId(detail.key, 'label'))
          ).textContent
        ).toContain(rows.find((r) => r.key === detail.key)?.label);
        expect(
          (await screen.findByTestId(testId(detail.key, 'value'))).textContent
        ).toContain(detail.value);
      }
    }
  );
});
