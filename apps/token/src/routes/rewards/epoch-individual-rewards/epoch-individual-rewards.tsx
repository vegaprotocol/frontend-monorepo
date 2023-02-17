import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/react-helpers';
import { useRewardsQuery } from '../home/__generated__/Rewards';
import { ENV } from '../../../config';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { EpochIndividualRewardsTable } from './epoch-individual-rewards-table';
import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';

export const EpochIndividualRewards = () => {
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { delegationsPagination } = ENV;

  const { data, loading, error } = useRewardsQuery({
    variables: {
      partyId: pubKey || '',
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
        </div>
      )}
    />
  );
};
