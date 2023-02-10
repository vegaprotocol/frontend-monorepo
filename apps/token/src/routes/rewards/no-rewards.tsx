import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { SubHeading } from '../../components/heading';

export const NoRewards = () => {
  const { t } = useTranslation();

  const classes = classNames(
    'flex flex-col items-center justify-center h-[300px] w-full',
    'border border-vega-dark-200'
  );

  return (
    <div className={classes}>
      <SubHeading title={t('noRewardsHaveBeenDistributedYet')} />
      <p className="font-alpha text-xl">{t('checkBackSoon')}</p>
    </div>
  );
};
