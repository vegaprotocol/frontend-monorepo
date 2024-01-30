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
import {
  asETH,
  formatEther,
  formatNumber,
  removeDecimal,
  toQUSD,
  unitiseEther,
} from '@vegaprotocol/utils';
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
    const {
      basePrice: basePricePerGas,
      maxPrice: maxPricePerGas,
      gas,
    } = gasPrice;
    const basePrice = basePricePerGas.multipliedBy(gas);
    const maxPrice = maxPricePerGas.multipliedBy(gas);

    const basePriceQUSD = toQUSD(basePrice, wethQuantum);
    const maxPriceQUSD = toQUSD(maxPrice, wethQuantum);

    const withdrawalAmountQUSD = toQUSD(value, quantum);

    const isExpensive =
      !withdrawalAmountQUSD.isLessThanOrEqualTo(0) &&
      withdrawalAmountQUSD.isLessThanOrEqualTo(maxPriceQUSD);
    const expensiveClassNames = {
      'text-vega-red-500':
        isExpensive && withdrawalAmountQUSD.isLessThanOrEqualTo(basePriceQUSD),
      'text-vega-orange-500':
        isExpensive &&
        withdrawalAmountQUSD.isGreaterThan(basePriceQUSD) &&
        withdrawalAmountQUSD.isLessThanOrEqualTo(maxPriceQUSD),
    };

    const uBasePricePerGas = unitiseEther(basePricePerGas);
    const uMaxPricePerGas = unitiseEther(
      maxPricePerGas,
      uBasePricePerGas[1] // forces the same unit as min price
    );

    const uBasePrice = unitiseEther(basePrice);
    const uMaxPrice = unitiseEther(maxPrice, uBasePrice[1]);

    let range = (
      <span>
        {formatEther(uBasePrice, 0, true)} - {formatEther(uMaxPrice)}
      </span>
    );
    // displays range as ETH when it's greater that 1000000 gwei
    if (uBasePrice[0].isGreaterThan(1e6)) {
      range = (
        <span className="flex flex-col font-mono md:text-[11px]">
          <span>
            {t('min')}: {asETH(basePrice)}
          </span>
          <span>
            {t('max')}: {asETH(maxPrice)}
          </span>
        </span>
      );
    }

    return (
      <div className={classNames('flex flex-col items-end self-end')}>
        <Tooltip description={t('The current gas price range')}>
          <span>
            {/* base price per gas unit */}
            {formatEther(uBasePricePerGas, 0, true)} -{' '}
            {formatEther(uMaxPricePerGas)} / gas
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
                  <strong>
                    (~{formatNumber(withdrawalAmountQUSD, 2)} qUSD)
                  </strong>
                  .
                </span>
              )}
              <span>
                {formatNumber(gas)} gas &times; {asETH(basePricePerGas)} ={' '}
                {asETH(basePrice)}
              </span>
              <span>
                {formatNumber(gas)} gas &times; {asETH(maxPricePerGas)} ={' '}
                {asETH(maxPrice)}
              </span>
            </div>
          }
        >
          <span className={classNames(expensiveClassNames, 'text-xs')}>
            {range}
          </span>
        </Tooltip>

        <span className="text-muted text-xs">
          ~{formatNumber(basePriceQUSD, 2)} - {formatNumber(maxPriceQUSD, 2)}{' '}
          qUSD
        </span>
      </div>
    );
  }

  return '-';
};
