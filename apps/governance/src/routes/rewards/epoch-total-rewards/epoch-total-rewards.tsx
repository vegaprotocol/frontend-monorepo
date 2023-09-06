import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import type { EpochFieldsFragment } from '../home/__generated__/Rewards';
import { useEpochAssetsRewardsQuery } from '../home/__generated__/Rewards';
import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { EpochTotalRewardsTable } from './epoch-total-rewards-table';
import { calculateEpochOffset } from '../../../lib/epoch-pagination';
import { useNetworkParam } from '@vegaprotocol/network-parameters';

const EPOCHS_PAGE_SIZE = 10;

type EpochTotalRewardsProps = {
  currentEpoch: EpochFieldsFragment;
};

export const EpochTotalRewards = ({ currentEpoch }: EpochTotalRewardsProps) => {
  // we start from the previous epoch when displaying rewards data, because the current one has no calculated data while ongoing
  const epochId = Number(currentEpoch.id) - 1;
  const totalPages = Math.ceil(epochId / EPOCHS_PAGE_SIZE);
  const { t } = useTranslation();
  const { param: marketCreationQuantumMultiple } = useNetworkParam(
    'rewards_marketCreationQuantumMultiple'
  );
  console.log(marketCreationQuantumMultiple);
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useEpochAssetsRewardsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      epochRewardSummariesFilter: {
        fromEpoch: epochId - EPOCHS_PAGE_SIZE,
      },
    },
  });

  const refetchData = useCallback(
    async (toPage?: number) => {
      const targetPage = toPage ?? page;
      await refetch({
        epochRewardSummariesFilter: calculateEpochOffset({
          epochId,
          page: targetPage,
          size: EPOCHS_PAGE_SIZE,
        }),
      });
      setPage(targetPage);
    },
    [epochId, page, refetch]
  );

  useEffect(() => {
    // when the epoch changes, we want to refetch the data to update the current page
    if (data) {
      refetchData();
    }
  }, [epochId, data, refetchData]);

  const epochTotalRewardSummaries =
    generateEpochTotalRewardsList({
      data,
      epochId,
      page,
      size: EPOCHS_PAGE_SIZE,
    }) || [];

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
          {Array.from(epochTotalRewardSummaries.values()).map(
            (epochTotalSummary, index) => (
              <EpochTotalRewardsTable
                marketCreationQuantumMultiple={marketCreationQuantumMultiple}
                data={epochTotalSummary}
                key={index}
              />
            )
          )}
          <Pagination
            isLoading={loading}
            hasPrevPage={page > 1}
            hasNextPage={page < totalPages}
            onBack={() => refetchData(page - 1)}
            onNext={() => refetchData(page + 1)}
            onFirst={() => refetchData(1)}
            onLast={() => refetchData(totalPages)}
          >
            {t('Page')} {page}
          </Pagination>
        </div>
      )}
    />
  );
};
