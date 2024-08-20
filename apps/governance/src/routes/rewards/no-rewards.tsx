import { cn } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { SubHeading } from '../../components/heading';

export const NoRewards = () => {
  const { t } = useTranslation();

  const classes = cn(
    'flex flex-col items-center justify-center h-[300px] w-full',
    'border border-gs-200'
  );

  return (
    <div className={classes}>
      <SubHeading title={t('noRewardsHaveBeenDistributedYet')} />
      <p className="font-alt calt text-xl">{t('checkBackSoon')}</p>
    </div>
  );
};
