import { useState, useCallback } from 'react';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import type {
  EpochFieldsFragment} from '../home/__generated__/Rewards';
import {
  useEpochAssetsRewardsQuery
} from '../home/__generated__/Rewards';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { NoRewards } from '../no-rewards';
import { EpochTotalRewardsTable } from './epoch-total-rewards-table';

const EPOCHS_PAGE_SIZE = 10;

type EpochTotalRewardsProps = {
  currentEpoch: EpochFieldsFragment;
};

export const EpochTotalRewards = ({ currentEpoch }: EpochTotalRewardsProps) => {
  const epochId = parseInt(currentEpoch.id);
  const totalPages = Math.ceil(epochId / EPOCHS_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useEpochAssetsRewardsQuery({
    variables: {
      epochRewardSummariesFilter: {
        fromEpoch: epochId - EPOCHS_PAGE_SIZE,
        toEpoch: epochId,
      },
    },
  });
  useRefreshAfterEpoch(currentEpoch.timestamps.expiry, refetch);

  const paginate = useCallback(
    async (toPage: number) => {
      try {
        await refetch({
          epochRewardSummariesFilter: {
            fromEpoch: epochId - EPOCHS_PAGE_SIZE * toPage,
            toEpoch: epochId - EPOCHS_PAGE_SIZE * toPage + EPOCHS_PAGE_SIZE - 1,
          },
        });
        setPage(toPage);
      } catch (err) {
        console.error(err);
      }
    },
    [epochId, page, totalPages, refetch]
  );

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
          <Pagination
            className="my-2"
            isLoading={loading}
            hasPrevPage={page > 1}
            hasNextPage={page < totalPages}
            onBack={() => paginate(page - 1)}
            onNext={() => paginate(page + 1)}
          >
            Page {page}
          </Pagination>
        </div>
      )}
    />
  );
};
