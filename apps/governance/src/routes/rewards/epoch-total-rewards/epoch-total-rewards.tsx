import { useState, useCallback } from 'react';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import { useEpochAssetsRewardsQuery } from '../home/__generated__/Rewards';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { NoRewards } from '../no-rewards';
import { EpochTotalRewardsTable } from './epoch-total-rewards-table';

const REWARDS_PAGE_SIZE = 5;

export const EpochTotalRewards = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch, fetchMore } =
    useEpochAssetsRewardsQuery({
      variables: {
        epochRewardSummariesPagination: {
          first: REWARDS_PAGE_SIZE,
        },
      },
    });
  useRefreshAfterEpoch(data?.epoch.timestamps.expiry, refetch);

  const epochTotalRewardSummaries = generateEpochTotalRewardsList(data) || [];

  const paginate = useCallback(
    async (fromPage: number, toPage: number) => {
      console.log(data?.epochRewardSummaries?.pageInfo);
      if (fromPage < toPage && toPage > 0) {
        await fetchMore({
          variables: {
            epochRewardSummariesPagination: {
              first: REWARDS_PAGE_SIZE,
              after: data?.epochRewardSummaries?.pageInfo?.endCursor,
            },
          },
        });
        setPage(toPage);
      }
      if (fromPage < toPage) {
        await fetchMore({
          variables: {
            epochRewardSummariesPagination: {
              last: REWARDS_PAGE_SIZE,
              before: data?.epochRewardSummaries?.pageInfo?.startCursor,
            },
          },
        });
        setPage(toPage);
      }
    },
    [fetchMore, data]
  );

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
          <Pagination
            className="my-2"
            isLoading={loading}
            hasPrevPage={Boolean(
              data?.epochRewardSummaries?.pageInfo?.hasPreviousPage
            )}
            hasNextPage={Boolean(
              data?.epochRewardSummaries?.pageInfo?.hasNextPage
            )}
            onBack={() => paginate(page, page - 1)}
            onNext={() => paginate(page, page + 1)}
          >
            Page {page}
          </Pagination>
        </div>
      )}
    />
  );
};
