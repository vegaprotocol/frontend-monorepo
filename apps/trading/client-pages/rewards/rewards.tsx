import { t } from '@vegaprotocol/i18n';
import { RewardsContainer } from '../../components/rewards-container';

export const Rewards = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="px-4 pb-4 text-2xl">{t('Rewards')}</h1>
      <RewardsContainer />
    </div>
  );
};
