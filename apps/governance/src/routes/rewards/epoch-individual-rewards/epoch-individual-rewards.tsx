import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import type { EpochFieldsFragment } from '../home/__generated__/Rewards';
import { useRewardsQuery } from '../home/__generated__/Rewards';
import { ENV } from '../../../config';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { EpochIndividualRewardsTable } from './epoch-individual-rewards-table';
import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';

const EPOCHS_PAGE_SIZE = 10;

type EpochTotalRewardsProps = {
  currentEpoch: EpochFieldsFragment;
};

export const EpochIndividualRewards = ({
  currentEpoch,
}: EpochTotalRewardsProps) => {
  const epochId = parseInt(currentEpoch.id);
  const totalPages = Math.ceil(epochId / EPOCHS_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { delegationsPagination } = ENV;

  const { data, loading, error, refetch } = useRewardsQuery({
    variables: {
      partyId: pubKey || '',
      fromEpoch: epochId - EPOCHS_PAGE_SIZE,
      toEpoch: epochId,
    },
    skip: !pubKey,
  });

  const rewards = useMemo(() => {
    if (!data?.party || !data.party.rewardsConnection?.edges?.length) return [];

    return removePaginationWrapper(data.party.rewardsConnection.edges);
  }, [data]);

  const epochIndividualRewardSummaries = useMemo(() => {
    if (!data?.party) return [];
    return generateEpochIndividualRewardsList(rewards);
  }, [data?.party, rewards]);

  const paginate = useCallback(
    async (toPage: number) => {
      try {
        await refetch({
          fromEpoch: epochId - EPOCHS_PAGE_SIZE * toPage,
          toEpoch: epochId - EPOCHS_PAGE_SIZE * toPage + EPOCHS_PAGE_SIZE - 1,
        });
        setPage(toPage);
      } catch (err) {
        console.error(err);
      }
    },
    [refetch, setPage, data]
  );

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
          {epochIndividualRewardSummaries.length ? (
            epochIndividualRewardSummaries.map(
              (epochIndividualRewardSummary) => (
                <EpochIndividualRewardsTable
                  data={epochIndividualRewardSummary}
                />
              )
            )
          ) : (
            <p>{t('noRewards')}</p>
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
