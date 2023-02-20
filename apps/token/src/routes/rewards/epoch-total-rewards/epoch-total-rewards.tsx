import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEpochAssetsRewardsQuery } from '../home/__generated__/Rewards';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { NoRewards } from '../no-rewards';
import { EpochTotalRewardsTable } from './epoch-total-rewards-table';

export const EpochTotalRewards = () => {
  const { data, loading, error, refetch } = useEpochAssetsRewardsQuery({
    variables: {
      epochRewardSummariesPagination: {
        first: 10,
      },
    },
  });
  useRefreshAfterEpoch(data?.epoch.timestamps.expiry, refetch);

  const epochTotalRewardSummaries = generateEpochTotalRewardsList(data) || [];

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data}
      render={() => (
        <div
          className="max-w-full overflow-auto"
          data-testid="epoch-rewards-total"
        >
          {epochTotalRewardSummaries.length === 0 ? (
            <NoRewards />
          ) : (
            <>
              {epochTotalRewardSummaries.map((epochTotalSummary, index) => (
                <EpochTotalRewardsTable data={epochTotalSummary} key={index} />
              ))}
            </>
          )}
        </div>
      )}
    />
  );
};
