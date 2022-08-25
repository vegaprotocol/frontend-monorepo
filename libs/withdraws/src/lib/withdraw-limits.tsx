import { getRelativeTimeFormat, t } from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import { formatDistanceToNow } from 'date-fns';

interface WithdrawLimitsProps {
  amount: string;
  threshold: BigNumber;
  balance: BigNumber;
  delay: number | undefined;
}

export const WithdrawLimits = ({
  amount,
  threshold,
  balance,
  delay,
}: WithdrawLimitsProps) => {
  let text = '';

  if (threshold.isEqualTo(Infinity)) {
    text = t('No limit');
  } else if (threshold.isGreaterThan(1_000_000)) {
    text = t('1m+');
  } else {
    text = threshold.toString();
  }

  const delayTime =
    new BigNumber(amount).isGreaterThan(threshold) && delay
      ? formatDistanceToNow(Date.now() + delay * 1000)
      : t('None');

  return (
    <table className="w-full text-sm">
      <tbody>
        <tr>
          <th className="text-left font-normal">{t('Balance available')}</th>
          <td className="text-right">{balance.toString()}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">
            {t('Delayed withdrawal threshold')}
          </th>
          <td className="text-right">{text}</td>
        </tr>
        <tr>
          <th className="text-left font-normal">{t('Delay time')}</th>
          <td className="text-right">{delayTime}</td>
        </tr>
      </tbody>
    </table>
  );
};
