import type { Asset } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { formatDistanceToNow } from 'date-fns';

interface WithdrawLimitsProps {
  amount: string;
  threshold: BigNumber;
  balance: BigNumber;
  delay: number | undefined;
  asset: Asset;
}

export const WithdrawLimits = ({
  amount,
  threshold,
  balance,
  delay,
  asset,
}: WithdrawLimitsProps) => {
  const delayTime =
    new BigNumber(amount).isGreaterThan(threshold) && delay
      ? formatDistanceToNow(Date.now() + delay * 1000)
      : t('None');

  const limits = [
    {
      key: 'BALANCE_AVAILABLE',
      label: t('Balance available'),
      rawValue: balance,
      value: balance ? (
        <CompactNumber number={balance} decimals={asset.decimals} />
      ) : (
        '-'
      ),
    },
    {
      key: 'WITHDRAWAL_THRESHOLD',
      label: t('Delayed withdrawal threshold'),
      rawValue: threshold,
      value: <CompactNumber number={threshold} decimals={asset.decimals} />,
    },
    {
      key: 'DELAY_TIME',
      label: t('Delay time'),
      value: delayTime,
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
