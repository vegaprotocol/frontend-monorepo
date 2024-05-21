import { EpochCountdown, TinyScroll } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { RewardsContainer } from '../../components/rewards-container';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { useRewardsEpochQuery } from '../../lib/hooks/__generated__/Rewards';
import { Card } from '../../components/card';

export const Rewards = () => {
  const t = useT();
  const title = t('Rewards');
  usePageTitle(title);

  const { data: epochData, loading } = useRewardsEpochQuery();

  return (
    <ErrorBoundary feature="rewards">
      <TinyScroll className="p-2">
        <div className="flex flex-row w-full pb-2 justify-between">
          <h1 className="md:px-4 pb-4 p-2 text-2xl">{title}</h1>
          <Card loading={loading}>
            {epochData && (
              <EpochCountdown
                id={epochData.epoch.id}
                startDate={new Date(epochData.epoch.timestamps.start)}
                endDate={new Date(epochData.epoch.timestamps.expiry)}
              />
            )}
          </Card>
        </div>
        <RewardsContainer />
      </TinyScroll>
    </ErrorBoundary>
  );
};
