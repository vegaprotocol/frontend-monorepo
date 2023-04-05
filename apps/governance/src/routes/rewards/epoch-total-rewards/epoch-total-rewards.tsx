import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import type { EpochFieldsFragment } from '../home/__generated__/Rewards';
import { useEpochAssetsRewardsQuery } from '../home/__generated__/Rewards';
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
  const { t } = useTranslation()
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useEpochAssetsRewardsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      epochRewardSummariesFilter: {
        fromEpoch: epochId - EPOCHS_PAGE_SIZE,
      },
    },
  });

  const refetchData = useCallback(async (toPage?: number) => {
    const targetPage = toPage ?? page
    try {
      await refetch({
        epochRewardSummariesFilter: {
          fromEpoch: epochId - EPOCHS_PAGE_SIZE * targetPage,
          toEpoch: epochId - EPOCHS_PAGE_SIZE * targetPage + EPOCHS_PAGE_SIZE,
        },
      })
      setPage(targetPage)
    // eslint-disable-next-line no-empty
    } catch (err) {
      // no-op, the error will be in the original query
    }
  }, [epochId, page, refetch])

  useEffect(() => {
    // when the epoch changes, we want to refetch the data to update the current page
    if (data) {
      refetchData()
    }
  }, [epochId, data, refetchData])

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
            onBack={() => refetchData(page - 1)}
            onNext={() => refetchData(page + 1)}
          >
            {t('Page')} {page}
          </Pagination>
        </div>
      )}
    />
  );
};
