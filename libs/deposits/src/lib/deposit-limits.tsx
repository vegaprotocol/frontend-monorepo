import type { Asset } from '@vegaprotocol/assets';
import { compactNumber, t } from '@vegaprotocol/react-helpers';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import type BigNumber from 'bignumber.js';

// Note: all of the values here are with correct asset's decimals
// See `libs/deposits/src/lib/use-deposit-balances.ts`

interface DepositLimitsProps {
  max: BigNumber;
  deposited: BigNumber;
  asset: Asset;
  balance?: BigNumber;
  allowance?: BigNumber;
}

export const DepositLimits = ({
  max,
  deposited,
  asset,
  balance,
  allowance,
}: DepositLimitsProps) => {
  const limits = [
    {
      key: 'BALANCE_AVAILABLE',
      label: t('Balance available'),
      rawValue: balance,
      value: balance ? compactNumber(balance, asset.decimals) : '-',
    },
    {
      key: 'MAX_LIMIT',
      label: t('Maximum total deposit amount'),
      rawValue: max,
      value: compactNumber(max, asset.decimals),
    },
    {
      key: 'DEPOSITED',
      label: t('Deposited'),
      rawValue: deposited,
      value: compactNumber(deposited, asset.decimals),
    },
    {
      key: 'REMAINING',
      label: t('Remaining'),
      rawValue: max.minus(deposited),
      value: compactNumber(max.minus(deposited), asset.decimals),
    },
    {
      key: 'ALLOWANCE',
      label: t('Approved'),
      rawValue: allowance,
      value: allowance ? compactNumber(allowance, asset.decimals) : '-',
    },
  ];

  return (
    <KeyValueTable>
      {limits.map(({ key, label, rawValue, value }) => (
        <KeyValueTableRow key={key}>
          <div data-testid={`${key}_label`}>{label}</div>
          <div
            data-testid={`${key}_value`}
            className="truncate"
            title={rawValue?.toString()}
          >
            {value}
          </div>
        </KeyValueTableRow>
      ))}
    </KeyValueTable>
  );
};
