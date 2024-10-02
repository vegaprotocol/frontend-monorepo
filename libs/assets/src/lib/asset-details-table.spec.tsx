import { render, screen, renderHook } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { Asset } from './asset-data-provider';
import {
  AssetDetail,
  AssetDetailsTable,
  useRows,
  testId,
  num,
  type AssetDetailsTableProps,
} from './asset-details-table';
import { generateBuiltinAsset, generateERC20Asset } from './test-helpers';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

describe('num formatting', () => {
  it('show unlimited for large values', () => {
    const usdLimit =
      '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    const asset = { decimals: 10 } as unknown as Asset;
    expect(num(asset, usdLimit)).toEqual('Unlimited');
  });
});

describe('AssetDetailsTable', () => {
  const renderComponent = (props: AssetDetailsTableProps) => {
    return render(
      <TooltipProvider>
        <AssetDetailsTable {...props} />
      </TooltipProvider>
    );
  };

  const cases: [string, Asset, { key: AssetDetail; value: string }[]][] = [
    [
      'ERC20 asset',
      generateERC20Asset(1, Schema.AssetStatus.STATUS_ENABLED),
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
      ],
    ],
    [
      'Builtin asset',
      generateBuiltinAsset(1, Schema.AssetStatus.STATUS_ENABLED),
      [
        { key: AssetDetail.ID, value: 'B-01' },
        { key: AssetDetail.TYPE, value: 'Builtin asset' },
        { key: AssetDetail.NAME, value: 'Builtin 01' },
        { key: AssetDetail.SYMBOL, value: 'BIA01' },
        { key: AssetDetail.DECIMALS, value: '5' },
        { key: AssetDetail.QUANTUM, value: '1' },
        { key: AssetDetail.STATUS, value: 'Enabled' },
        { key: AssetDetail.MAX_FAUCET_AMOUNT_MINT, value: '50,000' },
      ],
    ],
  ];

  it.each(cases)(
    "displays the available asset's data of %p with correct labels",
    async (_type, asset, details) => {
      const { result } = renderHook(() => useRows());
      const rows = result.current;
      renderComponent({ asset });
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

  it('omits specified rows when omitRows prop is provided', async () => {
    const asset = generateERC20Asset(1, Schema.AssetStatus.STATUS_ENABLED);
    const omittedKeys = [AssetDetail.TYPE, AssetDetail.DECIMALS];
    renderComponent({ asset, omitRows: omittedKeys });

    for (const key of omittedKeys) {
      expect(screen.queryByTestId(testId(key, 'label'))).toBeNull();
      expect(screen.queryByTestId(testId(key, 'value'))).toBeNull();
    }
  });
});
