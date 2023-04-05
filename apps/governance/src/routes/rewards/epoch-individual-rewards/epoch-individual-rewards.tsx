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
    return generateEpochIndividualRewardsList(rewards);
  }, [data?.party, rewards]);

  const refetchData = useCallback(
    async (toPage?: number) => {
      const targetPage = toPage ?? page;
      try {
        await refetch({
          partyId: pubKey || '',
          fromEpoch: epochId - EPOCHS_PAGE_SIZE * targetPage,
          toEpoch: epochId - EPOCHS_PAGE_SIZE * targetPage + EPOCHS_PAGE_SIZE,
          delegationsPagination: delegationsPagination
            ? {
                first: Number(delegationsPagination),
              }
            : undefined,
        });
        setPage(targetPage);
        // eslint-disable-next-line no-empty
      } catch (err) {
        // no-op, the error will be in the original query
      }
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
