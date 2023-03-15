import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useRewardsQuery } from '../home/__generated__/Rewards';
import { ENV } from '../../../config';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { EpochIndividualRewardsTable } from './epoch-individual-rewards-table';
import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';

const REWARDS_PAGE_SIZE = 5;

export const EpochIndividualRewards = () => {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { delegationsPagination } = ENV;

  const { data, loading, error, fetchMore } = useRewardsQuery({
    variables: {
      partyId: pubKey || '',
      rewardsPagination: {
        first: REWARDS_PAGE_SIZE,
      },
      delegationsPagination: {
        first: delegationsPagination
          ? Number(delegationsPagination)
          : undefined,
      },
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
    async (fromPage: number, toPage: number) => {
      if (fromPage < toPage && toPage > 0) {
        await fetchMore({
          variables: {
            partyId: pubKey || '',
            rewardsPagination: {
              first: REWARDS_PAGE_SIZE,
              last: null,
              after: data?.party?.rewardsConnection?.pageInfo?.endCursor,
            },
            delegationsPagination: {
              first: delegationsPagination
                ? Number(delegationsPagination)
                : undefined,
            },
          },
        });
        setPage(toPage);
      }
      if (fromPage < toPage) {
        await fetchMore({
          variables: {
            partyId: pubKey || '',
            rewardsPagination: {
              first: null,
              last: REWARDS_PAGE_SIZE,
              before: data?.party?.rewardsConnection?.pageInfo?.endCursor,
            },
            delegationsPagination: {
              first: delegationsPagination
                ? Number(delegationsPagination)
                : undefined,
            },
          },
        });
        setPage(toPage);
      }
    },
    [fetchMore, setPage, data]
  );

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data}
      render={() => (
        <div>
          <p className="mb-10">
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
            hasPrevPage={Boolean(
              data?.party?.rewardsConnection?.pageInfo?.hasPreviousPage
            )}
            hasNextPage={Boolean(
              data?.party?.rewardsConnection?.pageInfo?.hasNextPage
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
