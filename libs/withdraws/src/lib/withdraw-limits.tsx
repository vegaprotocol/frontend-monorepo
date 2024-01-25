import type { Asset } from '@vegaprotocol/assets';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import { WITHDRAW_THRESHOLD_TOOLTIP_TEXT, useWETH } from '@vegaprotocol/assets';
import {
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { formatDistanceToNow } from 'date-fns';
import { useT } from './use-t';
import { type GasData } from '@vegaprotocol/web3';
import { formatNumber, removeDecimal, toQUSD } from '@vegaprotocol/utils';
import { utils } from 'ethers';
import classNames from 'classnames';

interface WithdrawLimitsProps {
  amount: string;
  threshold: BigNumber | undefined;
  balance: BigNumber;
  delay: number | undefined;
  asset: Asset;
  gas?: GasData;
}

export const WithdrawLimits = ({
  amount,
  threshold,
  balance,
  delay,
  asset,
  gas,
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
    {
      key: 'GAS_FEE',
      tooltip: t(
        'Estimated gas fee for the withdrawal transaction (refreshes each 15 seconds)'
      ),
      label: t('Gas fee'),
      value: (
        <GasPrice
          gasPrice={gas}
          amount={{
            value: removeDecimal(amount, asset.decimals),
            quantum: asset.quantum,
          }}
        />
      ),
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

const GasPrice = ({
  gasPrice,
  amount,
}: {
  gasPrice: WithdrawLimitsProps['gas'];
  amount: { value: string; quantum: string };
}) => {
  const t = useT();
  const { quantum: wethQuantum } = useWETH();
  const { value, quantum } = amount;
  if (gasPrice) {
    const { basePrice, maxPrice, gas } = gasPrice;
    const b = basePrice.mul(gas);
    const m = maxPrice.mul(gas);

    const bGwei = utils.formatUnits(b, 'gwei');
    const mGwei = utils.formatUnits(m, 'gwei');

    const bEther = utils.formatUnits(b, 'ether');
    const mEther = utils.formatUnits(m, 'ether');

    const bQUSD = toQUSD(b.toNumber(), wethQuantum);
    const mQUSD = toQUSD(m.toNumber(), wethQuantum);

    const vQUSD = toQUSD(value, quantum);

    const isExpensive =
      !vQUSD.isLessThanOrEqualTo(0) && vQUSD.isLessThanOrEqualTo(mQUSD);
    const expensiveClassNames = {
      'text-vega-red-500': isExpensive && vQUSD.isLessThanOrEqualTo(bQUSD),
      'text-vega-orange-500':
        isExpensive &&
        vQUSD.isGreaterThan(bQUSD) &&
        vQUSD.isLessThanOrEqualTo(mQUSD),
    };

    return (
      <div className={classNames('flex flex-col items-end self-end')}>
        <Tooltip
          description={
            <div className="flex flex-col gap-1">
              {isExpensive && (
                <span className={classNames(expensiveClassNames)}>
                  {t(
                    "It seems that the current gas prices are exceeding the amount you're trying to withdraw"
                  )}{' '}
                  <strong>(~{vQUSD.toFixed(2)} qUSD)</strong>.
                </span>
              )}
              <span>
                {bEther} ETH - {mEther} ETH
              </span>
            </div>
          }
        >
          <span className={classNames(expensiveClassNames)}>
            {formatNumber(bGwei, 0)} gwei
            <span className="text-xs"> - {formatNumber(mGwei, 0)} gwei</span>
          </span>
        </Tooltip>

        <span className="text-muted text-xs">
          ~{formatNumber(bQUSD, 2)} qUSD - ~{formatNumber(mQUSD, 2)} qUSD
        </span>
      </div>
    );
  }

  return '-';
};
