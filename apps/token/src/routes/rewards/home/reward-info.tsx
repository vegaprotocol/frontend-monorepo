import * as Sentry from '@sentry/react';
import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../lib/bignumber';
import { DATE_FORMAT_DETAILED } from '../../../lib/date-formats';
import type {
  Rewards,
  Rewards_party_delegations,
  Rewards_party_rewardDetails_rewards,
} from './__generated__/Rewards';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';

interface RewardInfoProps {
  data: Rewards | undefined;
  currVegaKey: VegaKeyExtended;
  rewardAssetId: string;
}

// Note: For now the only reward type is Staking. We'll need this from the API
// at a later date
const DEFAULT_REWARD_TYPE = 'Staking';

export const RewardInfo = ({
  data,
  currVegaKey,
  rewardAssetId,
}: RewardInfoProps) => {
  const { t } = useTranslation();

  // Create array of rewards per epoch
  const vegaTokenRewards = React.useMemo(() => {
    if (!data?.party || !data.party.rewardDetails?.length) return [];

    const vegaTokenRewards = data.party.rewardDetails.find(
      (r) => r?.asset.id === rewardAssetId
    );

    // We only issue rewards as Vega tokens for now so there should only be one
    // item in the rewardDetails array
    if (!vegaTokenRewards) {
      const rewardAssets = data.party.rewardDetails
        .map((r) => r?.asset.symbol)
        .join(', ');
      Sentry.captureMessage(
        `Could not find VEGA token rewards ${rewardAssets}`
      );
      return [];
    }

    if (!vegaTokenRewards?.rewards?.length) return [];

    const sorted = Array.from(vegaTokenRewards.rewards).sort((a, b) => {
      if (!a || !b) return 0;
      if (a.epoch > b.epoch) return -1;
      if (a.epoch < b.epoch) return 1;
      return 0;
    });

    return sorted;
  }, [data, rewardAssetId]);

  return (
    <div className="mt-24">
      <p className="mb-8">
        {t('Connected Vega key')}: {currVegaKey.pub}
      </p>
      {vegaTokenRewards.length ? (
        vegaTokenRewards.map((reward, i) => {
          if (!reward) return null;
          return (
            <RewardTable
              key={i}
              reward={reward}
              delegations={data?.party?.delegations || []}
            />
          );
        })
      ) : (
        <p>{t('noRewards')}</p>
      )}
    </div>
  );
};

interface RewardTableProps {
  reward: Rewards_party_rewardDetails_rewards;
  delegations: Rewards_party_delegations[];
}

export const RewardTable = ({ reward, delegations }: RewardTableProps) => {
  const { t } = useTranslation();

  // Get your stake for epoch in which you have rewards
  const stakeForEpoch = React.useMemo(() => {
    if (!delegations.length) return '0';

    const delegationsForEpoch = delegations
      .filter((d) => d.epoch.toString() === reward.epoch.id)
      .map((d) => new BigNumber(d.amountFormatted));

    if (delegationsForEpoch.length) {
      return BigNumber.sum.apply(null, [
        new BigNumber(0),
        ...delegationsForEpoch,
      ]);
    }

    return new BigNumber(0);
  }, [delegations, reward.epoch]);

  return (
    <div className="mb-24">
      <h3 className="text-h5 text-white mb-4">
        {t('Epoch')} {reward.epoch.id}
      </h3>
      <KeyValueTable>
        <KeyValueTableRow>
          {t('rewardType')}
          <span>{DEFAULT_REWARD_TYPE}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('yourStake')}
          <span>{stakeForEpoch.toString()}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('reward')}
          <span>
            {reward.amountFormatted} {t('VEGA')}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('shareOfReward')}
          <span>
            {new BigNumber(reward.percentageOfTotal).dp(2).toString()}%
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('received')}
          <span>
            {format(new Date(reward.receivedAt), DATE_FORMAT_DETAILED)}
          </span>
        </KeyValueTableRow>
      </KeyValueTable>
    </div>
  );
};
