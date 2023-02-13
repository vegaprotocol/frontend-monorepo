import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';
import { BigNumber } from '../../../lib/bignumber';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { format } from 'date-fns';
import { DATE_FORMAT_DETAILED } from '../../../lib/date-formats';
import type {
  DelegationFieldsFragment,
  RewardFieldsFragment,
} from '../home/__generated__/Rewards';

interface RewardTableProps {
  reward: RewardFieldsFragment;
  delegations: DelegationFieldsFragment[] | [];
}

export const RewardTable = ({ reward, delegations }: RewardTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  // Get your stake for epoch in which you have rewards
  const stakeForEpoch = useMemo(() => {
    if (!delegations.length) return '0';

    const delegationsForEpoch = delegations
      .filter((d) => d.epoch.toString() === reward.epoch.id)
      .map((d) => toBigNum(d.amount, decimals));

    if (delegationsForEpoch.length) {
      return BigNumber.sum.apply(null, [
        new BigNumber(0),
        ...delegationsForEpoch,
      ]);
    }

    return new BigNumber(0);
  }, [decimals, delegations, reward.epoch.id]);

  return (
    <div className="mb-24">
      <h3 className="text-lg text-white mb-4">
        {t('Epoch')} {reward.epoch.id}
      </h3>
      <KeyValueTable>
        <KeyValueTableRow>
          {t('rewardType')}
          <span>{reward.rewardType}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('yourStake')}
          <span>{stakeForEpoch.toString()}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('reward')}
          <span>
            {formatNumber(toBigNum(reward.amount, decimals))}{' '}
            {reward.asset.symbol}
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
