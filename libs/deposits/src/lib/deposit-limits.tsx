import { t } from '@vegaprotocol/react-helpers';
import type BigNumber from 'bignumber.js';

interface DepositLimitsProps {
  limits: {
    max: BigNumber;
    deposited: BigNumber;
  };
  balance?: BigNumber;
}

export const DepositLimits = ({ limits, balance }: DepositLimitsProps) => {
  let maxLimit = '';
  if (limits.max.isEqualTo(Infinity)) {
    maxLimit = t('No limit');
  } else if (limits.max.isGreaterThan(1_000_000)) {
    maxLimit = t('1m+');
  } else {
    maxLimit = limits.max.toString();
  }

  let remaining = '';
  if (limits.deposited.isEqualTo(0)) {
    remaining = maxLimit;
  } else {
    const amountRemaining = limits.max.minus(limits.deposited);
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
          <td className="text-right">{limits.deposited.toString()}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">{t('Remaining')}</th>
          <td className="text-right">{remaining}</td>
        </tr>
      </tbody>
    </table>
  );
};
