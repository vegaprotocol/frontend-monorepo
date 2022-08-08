import { t } from '@vegaprotocol/react-helpers';
import type BigNumber from 'bignumber.js';

interface DepositLimitsProps {
  max: BigNumber;
  deposited: BigNumber;
  balance?: BigNumber;
}

export const DepositLimits = ({
  max,
  deposited,
  balance,
}: DepositLimitsProps) => {
  let maxLimit = '';
  if (max.isEqualTo(Infinity)) {
    maxLimit = t('No limit');
  } else if (max.isGreaterThan(1_000_000)) {
    maxLimit = t('1m+');
  } else {
    maxLimit = max.toString();
  }

  let remaining = '';
  if (deposited.isEqualTo(0)) {
    remaining = maxLimit;
  } else {
    const amountRemaining = max.minus(deposited);
    remaining = amountRemaining.isGreaterThan(1_000_000)
      ? t('1m+')
      : amountRemaining.toString();
  }

  return (
    <table className="w-full text-ui">
      <tbody>
        <tr>
          <th className="text-left font-normal">{t('Balance available')}</th>
          <td className="text-right">{balance ? balance.toString() : 0}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">
            {t('Maximum total deposit amount')}
          </th>
          <td className="text-right">{maxLimit}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">{t('Deposited')}</th>
          <td className="text-right">{deposited.toString()}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">{t('Remaining')}</th>
          <td className="text-right">{remaining}</td>
        </tr>
      </tbody>
    </table>
  );
};
