import { useState } from 'react';
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
  const [page, setPage] = useState(1);
  const { data, loading, error } = useEpochAssetsRewardsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      epochRewardSummariesFilter: calculateEpochOffset({
        epochId,
        page: page,
        size: EPOCHS_PAGE_SIZE,
      }),
    },
  });

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
            onBack={() => setPage((x) => x - 1)}
            onNext={() => setPage((x) => x + 1)}
            onFirst={() => setPage(1)}
            onLast={() => setPage(totalPages)}
          >
            {t('Page')} {page}
          </Pagination>
        </div>
      )}
    />
  );
};
