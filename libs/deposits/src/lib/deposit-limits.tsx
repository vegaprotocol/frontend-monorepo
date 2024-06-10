import type { Asset } from '@vegaprotocol/assets';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import {
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import type BigNumber from 'bignumber.js';
import { formatNumber, quantumDecimalPlaces } from '@vegaprotocol/utils';
import { useT } from './use-t';

// Note: all of the values here are with correct asset's decimals
// See `libs/deposits/src/lib/use-deposit-balances.ts`

interface DepositLimitsProps {
  max: BigNumber;
  deposited: BigNumber;
  asset: Asset;
  balance?: BigNumber;
  allowance?: BigNumber;
  exempt?: boolean;
}

export const DepositLimits = ({
  max,
  deposited,
  asset,
  balance,
  allowance,
  exempt,
}: DepositLimitsProps) => {
  const t = useT();
  const limits = [
    {
      key: 'BALANCE_AVAILABLE',
      label: t('Balance available'),
      rawValue: balance,
      value: balance ? (
        <CompactNumber
          number={balance}
          decimals={quantumDecimalPlaces(asset.quantum, asset.decimals)}
        />
      ) : (
        '-'
      ),
    },
    {
      key: 'REMAINING',
      label: (
        <Tooltip
          description={
            <>
              <p>
                {t(
                  'VEGA has a lifetime deposit limit of {{amount}} {{assetSymbol}} per address. This can be changed through governance',
                  {
                    amount: formatNumber(max.toString()),
                    assetSymbol: asset.symbol,
                  }
                )}
              </p>
              <p>
                {t(
                  'To date, {{currentDeposit}} {{assetSymbol}} has been deposited from this Ethereum address, so you can deposit up to {{remainingDeposit}} {{assetSymbol}} more.',
                  {
                    currentDeposit: formatNumber(deposited.toString()),
                    assetSymbol: asset.symbol,
                    remainingDeposit: formatNumber(
                      max.minus(deposited).toString()
                    ),
                  }
                )}
              </p>
            </>
          }
        >
          <button type="button">{t('Remaining deposit allowance')}</button>
        </Tooltip>
      ),
      rawValue: max.minus(deposited),
      value: !exempt ? (
        <CompactNumber
          number={max.minus(deposited)}
          decimals={quantumDecimalPlaces(asset.quantum, asset.decimals)}
        />
      ) : (
        <div data-testid="exempt">{t('Exempt')}</div>
      ),
    },
    {
      key: 'ALLOWANCE',
      label: (
        <Tooltip
          description={
            <p>
              {t(
                'The deposit cap is set when you approve an asset for use with this app. To increase this cap, approve {{assetSymbol}} again and choose a higher cap. Check the documentation for your Ethereum wallet app for details.',
                { assetSymbol: asset.symbol }
              )}
            </p>
          }
        >
          <button type="button">{t('Deposit cap')}</button>
        </Tooltip>
      ),
      rawValue: allowance,
      value: allowance ? (
        <CompactNumber
          number={allowance}
          decimals={quantumDecimalPlaces(asset.quantum, asset.decimals)}
        />
      ) : (
        '-'
      ),
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
