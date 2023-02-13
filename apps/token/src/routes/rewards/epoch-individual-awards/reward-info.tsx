import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/react-helpers';
import { useRewardsQuery } from '../home/__generated__/Rewards';
import { ENV } from '../../../config';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { RewardTable } from './reward-table';

export const RewardInfo = () => {
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

  const delegations = useMemo(() => {
    if (!data?.party || !data.party.delegationsConnection?.edges?.length) {
      return [];
    }

    return removePaginationWrapper(data.party.delegationsConnection.edges);
  }, [data]);

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data}
      render={() => (
        <div>
          <p>
            {t('Connected Vega key')}: {pubKey}
          </p>
          {rewards.length ? (
            rewards.map((reward, i) => {
              if (!reward) return null;
              return (
                <RewardTable
                  key={i}
                  reward={reward}
                  delegations={delegations || []}
                />
              );
            })
          ) : (
            <p>{t('noRewards')}</p>
          )}
        </div>
      )}
    />
  );
};
