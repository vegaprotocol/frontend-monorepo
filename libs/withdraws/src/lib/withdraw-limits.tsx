import { t } from '@vegaprotocol/react-helpers';
import type BigNumber from 'bignumber.js';

interface WithdrawLimitsProps {
  limits: {
    max: BigNumber;
  };
}

export const WithdrawLimits = ({ limits }: WithdrawLimitsProps) => {
  let maxLimit = '';

  if (limits.max.isEqualTo(Infinity)) {
    maxLimit = t('No limit');
  } else if (limits.max.isGreaterThan(1_000_000)) {
    maxLimit = t('1m+');
  } else {
    maxLimit = limits.max.toString();
  }

  return (
    <>
      <p className="text-ui font-bold">{t('Withdraw limits')}</p>
      <table className="w-full text-ui">
        <tbody>
          <tr>
            <th className="text-left font-normal">{t('Maximum')}</th>
            <td className="text-right">{maxLimit}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
