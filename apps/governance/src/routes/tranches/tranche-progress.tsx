import { useTranslation } from 'react-i18next';
import { getAbbreviatedNumber } from '../../lib/abbreviate-number';
import { ProgressBar } from './progress-bar';
import type { BigNumber } from '../../lib/bignumber';
import { theme } from '@vegaprotocol/tailwindcss-config';
const Colors = theme.colors;

interface TrancheProgressProps {
  locked: BigNumber;
  totalRemoved: BigNumber;
  totalAdded: BigNumber;
}

export const TrancheProgress = ({
  locked,
  totalRemoved,
  totalAdded,
}: TrancheProgressProps) => {
  const { t } = useTranslation();
  const lockedPercentage = totalAdded.isZero()
    ? 0
    : Math.round(locked.div(totalAdded).times(100).toNumber());
  const removedPercentage = totalAdded.isZero()
    ? 0
    : Math.round(totalRemoved.div(totalAdded).times(100).toNumber());
  return (
    <div className="tranches__progress">
      <div className="tranches__progress-item">
        <span className="tranches__progress-title">{t('Locked')}</span>
        <ProgressBar
          width={220}
          color={Colors.pink.DEFAULT}
          percentage={lockedPercentage}
        />
        <span className="tranches__progress-numbers">
          ({getAbbreviatedNumber(locked)} of {getAbbreviatedNumber(totalAdded)})
        </span>
      </div>
      <div className="tranches__progress-item">
        <span className="tranches__progress-title">{t('Redeemed')}</span>
        <ProgressBar
          width={220}
          color={Colors.green.DEFAULT}
          percentage={removedPercentage}
        />
        <span className="tranches__progress-numbers">
          ({getAbbreviatedNumber(totalRemoved)} {t('of')}{' '}
          {getAbbreviatedNumber(totalAdded)})
        </span>
      </div>
    </div>
  );
};
