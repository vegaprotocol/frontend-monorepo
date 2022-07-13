import { t } from '@vegaprotocol/react-helpers';
import type BigNumber from 'bignumber.js';

interface WithdrawLimitsProps {
  max: BigNumber;
}

export const WithdrawLimits = ({ max }: WithdrawLimitsProps) => {
  console.log(max.toString());
  const maxLimit = max.isEqualTo(Infinity) ? t('No limit') : max.toString();
  return (
    <>
      <p className="text-ui font-bold">{t('Temporary withdraw limits')}</p>
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
