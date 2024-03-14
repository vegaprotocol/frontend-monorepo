import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer, Pagination } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import type { EpochFieldsFragment } from '../home/__generated__/Rewards';
import { useRewardsQuery } from '../home/__generated__/Rewards';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { EpochIndividualRewardsTable } from './epoch-individual-rewards-table';
import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';
import { calculateEpochOffset } from '../../../lib/epoch-pagination';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import { filterAcceptableGraphqlErrors } from '../../../lib/party';

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
  const { param: marketCreationQuantumMultiple } = useNetworkParam(
    'rewards_marketCreationQuantumMultiple'
  );

  const { data, loading, error } = useRewardsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      partyId: pubKey || '',
      ...calculateEpochOffset({ epochId, page, size: EPOCHS_PAGE_SIZE }),
      delegationsPagination: { first: 50 },
    },
    skip: !pubKey,
  });

  const rewards = useMemo(() => {
    if (!data?.party || !data.party.rewardsConnection?.edges?.length) return [];

    return removePaginationWrapper(data.party.rewardsConnection.edges);
  }, [data]);

  const epochRewardSummaries = useMemo(() => {
    if (!data?.epochRewardSummaries) return [];

    return removePaginationWrapper(data.epochRewardSummaries.edges);
  }, [data]);

  const epochIndividualRewardSummaries = useMemo(() => {
    if (!data?.party) return [];
    return generateEpochIndividualRewardsList({
      rewards,
      epochId,
      epochRewardSummaries,
      page,
      size: EPOCHS_PAGE_SIZE,
    });
  }, [data?.party, epochId, epochRewardSummaries, page, rewards]);

  // Workarounds for the error handling of AsyncRenderer
  const filteredErrors = filterAcceptableGraphqlErrors(error);
  const filteredData = data || [];

  return (
    <AsyncRenderer
      loading={loading}
      error={filteredErrors}
      data={filteredData}
      render={() => (
        <div>
          <p data-testid="connected-vega-key" className="mb-10">
            {t('Connected Vega key')}:{' '}
            <span className="text-white">{pubKey}</span>
          </p>
          {epochIndividualRewardSummaries.length === 0 && (
            <p>{t('No rewards for key')}</p>
          )}
          {epochIndividualRewardSummaries.map(
            (epochIndividualRewardSummary) => (
              <EpochIndividualRewardsTable
                marketCreationQuantumMultiple={marketCreationQuantumMultiple}
                data={epochIndividualRewardSummary}
              />
            )
          )}
          {epochIndividualRewardSummaries.length > 0 && (
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
          )}
        </div>
      )}
    />
  );
};
