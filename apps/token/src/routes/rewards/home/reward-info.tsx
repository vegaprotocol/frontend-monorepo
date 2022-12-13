import * as Sentry from '@sentry/react';
import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  KeyValueTable,
  KeyValueTableRow,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../lib/bignumber';
import { DATE_FORMAT_DETAILED } from '../../../lib/date-formats';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { formatNumber, toBigNum, useFetch } from '@vegaprotocol/react-helpers';
import { useAppState } from '../../../contexts/app-state/app-state-context';

interface RewardInfoProps {
  currVegaKey: VegaKeyExtended;
  rewardAssetId: string;
}

export interface Reward {
  assetId: string;
  partyId: string;
  epoch: string;
  amount: string;
  percentageOfTotal: string;
  receivedAt: string;
  marketId: string;
  rewardType: string;
}

export interface RewardsResponse {
  rewards: Reward[];
}

export const RewardInfo = ({ currVegaKey, rewardAssetId }: RewardInfoProps) => {
  const { t } = useTranslation();
  const { state } = useFetch<RewardsResponse>(
    `${process.env['NX_VEGA_REST']}parties/${currVegaKey.pub}/rewards`
  );
  // Create array of rewards per epoch
  const vegaTokenRewards = React.useMemo(() => {
    if (!state.data?.rewards?.length) return [];

    const vegaTokenRewards = state.data.rewards.filter(
      (r) => r?.assetId === rewardAssetId
    );

    // We only issue rewards as Vega tokens for now so there should only be one
    // item in the rewardDetails array
    if (!vegaTokenRewards) {
      const rewardAssets = state.data.rewards.map((r) => r?.assetId).join(', ');
      Sentry.captureMessage(
        `Could not find VEGA token rewards ${rewardAssets}`
      );
      return [];
    }

    if (!vegaTokenRewards?.length) return [];

    const sorted = Array.from(vegaTokenRewards).sort((a, b) => {
      if (!a || !b) return 0;
      if (a.epoch > b.epoch) return -1;
      if (a.epoch < b.epoch) return 1;
      return 0;
    });

    return sorted;
  }, [rewardAssetId, state?.data?.rewards]);
  if (state.loading) return <Loader />;
  return (
    <div>
      <p>
        {t('Connected Vega key')}: {currVegaKey.pub}
      </p>
      {vegaTokenRewards.length ? (
        vegaTokenRewards.map((reward, i) => {
          if (!reward) return null;
          return <RewardTable key={i} reward={reward} />;
        })
      ) : (
        <p>{t('noRewards')}</p>
      )}
    </div>
  );
};

interface RewardTableProps {
  reward: Reward;
}

export const RewardTable = ({ reward }: RewardTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  return (
    <div className="mb-24">
      <h3 className="text-lg text-white mb-4">
        {t('Epoch')} {reward.epoch}
      </h3>
      <KeyValueTable>
        <KeyValueTableRow>
          {t('rewardType')}
          <span>{reward.rewardType}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('reward')}
          <span>
            {formatNumber(toBigNum(reward.amount, decimals))} {t('VEGA')}
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
            {format(
              new Date(Number(reward.receivedAt) / 1000000),
              DATE_FORMAT_DETAILED
            )}
          </span>
        </KeyValueTableRow>
      </KeyValueTable>
    </div>
  );
};
