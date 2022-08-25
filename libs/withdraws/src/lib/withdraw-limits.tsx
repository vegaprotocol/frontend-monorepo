import { t } from '@vegaprotocol/react-helpers';
import type BigNumber from 'bignumber.js';

interface WithdrawLimitsProps {
  threshold: BigNumber;
  balance: BigNumber;
}

export const WithdrawLimits = ({ threshold, balance }: WithdrawLimitsProps) => {
  let text = '';

  if (threshold.isEqualTo(Infinity)) {
    text = t('No limit');
  } else if (threshold.isGreaterThan(1_000_000)) {
    text = t('1m+');
  } else {
    text = threshold.toString();
  }

  return (
    <table className="w-full text-sm">
      <tbody>
        <tr>
          <th className="text-left font-normal">{t('Balance available')}</th>
          <td className="text-right">{balance.toString()}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">
            {t('Delayed withdrawal amount')}
          </th>
          <td className="text-right">{text}</td>
        </tr>
      </tbody>
    </table>
  );
};
