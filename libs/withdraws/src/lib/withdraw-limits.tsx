import type { Asset } from '@vegaprotocol/assets';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import { WITHDRAW_THRESHOLD_TOOLTIP_TEXT } from '@vegaprotocol/assets';
import {
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { formatDistanceToNow } from 'date-fns';
import { useT } from './use-t';

interface WithdrawLimitsProps {
  amount: string;
  threshold: BigNumber | undefined;
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
  const t = useT();
  const delayTime =
    threshold && delay && new BigNumber(amount).isGreaterThan(threshold)
      ? formatDistanceToNow(Date.now() + delay * 1000)
      : t('None');

  const limits: {
    key: string;
    label: string;
    value: string | JSX.Element;
    rawValue?: BigNumber;
    tooltip?: string;
  }[] = [
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
      tooltip: WITHDRAW_THRESHOLD_TOOLTIP_TEXT,
      rawValue: threshold,
      value: threshold ? (
        <CompactNumber number={threshold} decimals={asset.decimals} />
      ) : (
        '-'
      ),
    },
    {
      key: 'DELAY_TIME',
      label: t('Delay time'),
      value: threshold && delay ? delayTime : '-',
    },
  ];

  return (
    <KeyValueTable>
      {limits.map(({ key, label, rawValue, value, tooltip }) => (
        <KeyValueTableRow key={key}>
          <div data-testid={`${key}_label`}>
            {tooltip ? (
              <Tooltip description={tooltip}>
                <span>{label}</span>
              </Tooltip>
            ) : (
              label
            )}
          </div>
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
