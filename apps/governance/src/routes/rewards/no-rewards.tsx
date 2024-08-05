import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { SubHeading } from '../../components/heading';

export const NoRewards = () => {
  const { t } = useTranslation();

  const classes = classNames(
    'flex flex-col items-center justify-center h-[300px] w-full',
    'border border-gs-200'
  );

  return (
    <div className={classes}>
      <SubHeading title={t('noRewardsHaveBeenDistributedYet')} />
      <p className="font-alpha calt text-xl">{t('checkBackSoon')}</p>
    </div>
  );
};
