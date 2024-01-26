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

enum EtherUnit {
  wei = '0',
  kwei = '3',
  mwei = '6',
  gwei = '9',
  ether = '18',
}

const etherUnitMapping: Record<EtherUnit, string> = {
  [EtherUnit.wei]: 'wei',
  [EtherUnit.kwei]: 'kwei',
  [EtherUnit.mwei]: 'mwei',
  [EtherUnit.gwei]: 'gwei',
  [EtherUnit.ether]: 'ETH',
};

const formatPrice = (
  value: GasData['basePrice'] | GasData['maxPrice'],
  decimals = 0,
  forceUnit?: EtherUnit
): [price: string, unit: EtherUnit] => {
  // let idx = Math.ceil(value.toString().length / 3) - 1;
  let idx = Math.max(
    ...Object.values(EtherUnit)
      .map((u, i) => [value.toString().length - Number(u), i])
      .filter(([x, i]) => x > 0)
      .map((_, i) => i)
  );
  if (idx < 0) idx = 0;

  const unit = forceUnit || (Object.values(EtherUnit)[idx] as EtherUnit);
  return [formatNumber(utils.formatUnits(value, unit), decimals), unit];
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

    const [bp, bpunit] = formatPrice(basePrice);
    const [mp] = formatPrice(maxPrice, 0, bpunit);

    const [gbp, gbpunit] = formatPrice(b);
    const [gmp] = formatPrice(m, 0, gbpunit);

    const [bEther] = formatPrice(b, 18, EtherUnit.ether);
    const [mEther] = formatPrice(m, 18, EtherUnit.ether);

    return (
      <div className={classNames('flex flex-col items-end self-end')}>
        <Tooltip description={t('The current gas price range')}>
          <span>
            {bp} - {mp} {etherUnitMapping[bpunit]} / gas
          </span>
        </Tooltip>
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
                {gas.toString()} gas &times; {bp} {etherUnitMapping[bpunit]} ={' '}
                {bEther} ETH
              </span>
              <span>
                {gas.toString()} gas &times; {mp} {etherUnitMapping[bpunit]} ={' '}
                {mEther} ETH
              </span>
            </div>
          }
        >
          <span className={classNames(expensiveClassNames, 'text-xs')}>
            {gbp} - {gmp} {etherUnitMapping[gbpunit]}
          </span>
        </Tooltip>

        <span className="text-muted text-xs">
          ~{formatNumber(bQUSD, 2)} - {formatNumber(mQUSD, 2)} qUSD
        </span>
      </div>
    );
  }

  return '-';
};
