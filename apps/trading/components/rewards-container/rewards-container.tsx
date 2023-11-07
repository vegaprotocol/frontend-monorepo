import { t } from '@vegaprotocol/i18n';
import { Card } from '../card/card';

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
