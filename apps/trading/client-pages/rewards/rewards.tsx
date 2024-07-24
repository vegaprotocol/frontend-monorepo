import { EpochCountdown } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { RewardsContainer } from '../../components/rewards-container';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { useRewardsEpochQuery } from '../../lib/hooks/__generated__/Rewards';
import { Card } from '../../components/card';
import { HeaderPage } from '../../components/header-page';

export const Rewards = () => {
  const t = useT();
  const title = t('Rewards');
  usePageTitle(title);

  const { data: epochData, loading } = useRewardsEpochQuery();

  return (
    <ErrorBoundary feature="rewards">
      <header className="flex flex-col lg:flex-row justify-between gap-2">
        <HeaderPage>{title}</HeaderPage>
        <Card loading={loading}>
          {epochData && (
            <EpochCountdown
              id={epochData.epoch.id}
              startDate={new Date(epochData.epoch.timestamps.start)}
              endDate={new Date(epochData.epoch.timestamps.expiry)}
            />
          )}
        </Card>
      </header>
      <RewardsContainer />
    </ErrorBoundary>
  );
};
