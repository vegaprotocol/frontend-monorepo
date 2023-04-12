import { useMemo, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import type { EpochFieldsFragment } from '../home/__generated__/Rewards';
import { useRewardsQuery } from '../home/__generated__/Rewards';
import { ENV } from '../../../config';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { EpochIndividualRewardsTable } from './epoch-individual-rewards-table';
import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';
import { calculateEpochOffset } from '../../../lib/epoch-pagination';

const EPOCHS_PAGE_SIZE = 10;

type EpochTotalRewardsProps = {
  currentEpoch: EpochFieldsFragment;
};

export const EpochIndividualRewards = ({
  currentEpoch,
}: EpochTotalRewardsProps) => {
  // we start from the previous epoch when displaying rewards data, because the current one has no calculated data while ongoing
  const epochId = Number(currentEpoch.id) - 1;
  const totalPages = Math.ceil(epochId / EPOCHS_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { delegationsPagination } = ENV;

  const { data, loading, error, refetch } = useRewardsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      partyId: pubKey || '',
      fromEpoch: epochId - EPOCHS_PAGE_SIZE,
      toEpoch: epochId,
      delegationsPagination: delegationsPagination
        ? {
            first: Number(delegationsPagination),
          }
        : undefined,
    },
    skip: !pubKey,
  });

  const rewards = useMemo(() => {
    if (!data?.party || !data.party.rewardsConnection?.edges?.length) return [];

    return removePaginationWrapper(data.party.rewardsConnection.edges);
  }, [data]);

  const epochIndividualRewardSummaries = useMemo(() => {
    if (!data?.party) return [];
    return generateEpochIndividualRewardsList({
      rewards,
      epochId,
      page,
      size: EPOCHS_PAGE_SIZE,
    });
  }, [data?.party, epochId, page, rewards]);

  const refetchData = useCallback(
    async (toPage?: number) => {
      const targetPage = toPage ?? page;
      await refetch({
        partyId: pubKey || '',
        ...calculateEpochOffset({ epochId, page, size: EPOCHS_PAGE_SIZE }),
        delegationsPagination: delegationsPagination
          ? {
              first: Number(delegationsPagination),
            }
          : undefined,
      });
      setPage(targetPage);
    },
    [epochId, page, refetch, delegationsPagination, pubKey]
  );

  useEffect(() => {
    // when the epoch changes, we want to refetch the data to update the current page
    if (data) {
      refetchData();
    }
  }, [epochId, data, refetchData]);

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data}
      render={() => (
        <div>
          <p data-testid="connected-vega-key" className="mb-10">
            {t('Connected Vega key')}:{' '}
            <span className="text-white">{pubKey}</span>
          </p>
          {epochIndividualRewardSummaries.map(
            (epochIndividualRewardSummary) => (
              <EpochIndividualRewardsTable
                data={epochIndividualRewardSummary}
              />
            )
          )}
          <Pagination
            className="my-2"
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
