import { t } from '@vegaprotocol/i18n';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export const RewardsContainer = () => {
  return (
    <div className="p-4">
      <h3 className="mb-4">Rewards</h3>
      <div className="grid auto-rows-min grid-cols-6 gap-3">
        <Card title={t('Reward pot')} className="lg:col-span-2">
          TODO:
        </Card>
        <Card title={t('Vesting')} className="lg:col-span-2">
          TODO:
        </Card>
        <Card title={t('Rewards multipliers')} className="lg:col-span-2">
          TODO:
        </Card>
        <Card title={t('Activity streak')} className="lg:col-span-3">
          TODO:
        </Card>
        <Card title={t('Reward hoarder bonus')} className="lg:col-span-3">
          TODO:
        </Card>
        <Card title={t('Rewards history')} className="lg:col-span-full">
          TODO:
        </Card>
      </div>
    </div>
  );
};

export const Card = ({
  children,
  title,
  className,
  loading = false,
}: {
  children: ReactNode;
  title: string;
  className?: string;
  loading?: boolean;
}) => {
  return (
    <div
      className={classNames(
        'p-4 bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full lg:col-auto',
        'rounded-lg',
        className
      )}
    >
      <h2 className="mb-3">{title}</h2>
      {loading ? <CardLoader /> : children}
    </div>
  );
};

export const CardLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-5 bg-vega-clight-600 dark:bg-vega-cdark-600" />
      <div className="w-3/4 h-6 bg-vega-clight-600 dark:bg-vega-cdark-600" />
    </div>
  );
};
