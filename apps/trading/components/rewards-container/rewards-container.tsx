import type { Account} from '@vegaprotocol/accounts';
import { useAccounts } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParam,
} from '@vegaprotocol/network-parameters';
import { AccountType } from '@vegaprotocol/types';
import { TradingAnchorButton, TradingButton } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Links } from '../../lib/links';
import BigNumber from 'bignumber.js';
import { Link } from 'react-router-dom';
import { Card } from '../card/card';
import { getQuantumValue } from '@vegaprotocol/assets';

const REWARD_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
  AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
];

export const RewardsContainer = () => {
  const { pubKey } = useVegaWallet();
  const { param, loading: paramsLoading } = useNetworkParam(
    NetworkParams.rewards_activityStreak_benefitTiers
  );
  const { data: accounts, loading: accountsLoading } = useAccounts(pubKey);

  const loading = paramsLoading || accountsLoading;

  return (
    <div className="p-4">
      <h3 className="mb-4">Rewards</h3>
      <div className="grid auto-rows-min grid-cols-6 gap-3">
        <Card title={t('Reward pot')} className="lg:col-span-2">
          <RewardPot accounts={accounts} />
        </Card>
        <Card title={t('Vesting')} className="lg:col-span-2">
          TODO:
        </Card>
        <Card title={t('Rewards multipliers')} className="lg:col-span-2">
          TODO:
        </Card>
        <Card
          title={t('Activity streak')}
          className="lg:col-span-3"
          loading={loading}
        >
          <ActivityStreak />
        </Card>
        <Card title={t('Reward hoarder bonus')} className="lg:col-span-3">
          TODO:
        </Card>
        <Card title={t('Rewards history')} className="lg:col-span-full">
          TODO:
        </Card>
      </div>
    </div>
  );
};

export const RewardPot = ({ accounts }: { accounts: Account[] | null }) => {
  const rewardAccounts = accounts
    ? accounts.filter((a) => REWARD_ACCOUNT_TYPES.includes(a.type))
    : [];

  const vestedRewardAccounts = accounts
    ? accounts.filter((a) => a.type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS)
    : [];

  const totalRewards = BigNumber.sum.apply(
    null,
    rewardAccounts.length
      ? rewardAccounts.map((a) => getQuantumValue(a.balance, a.asset.quantum))
      : [0]
  );

  const totalVestedRewards = BigNumber.sum.apply(
    null,
    vestedRewardAccounts.length
      ? vestedRewardAccounts.map((a) =>
          getQuantumValue(a.balance, a.asset.quantum)
        )
      : [0]
  );

  return (
    <div>
      <p data-testid="total-rewards">
        {totalRewards.toString()} {t('qUSD')}
      </p>
      <p data-testid="available-rewards">
        {totalVestedRewards.toString()} {t('qUSD')}
      </p>
      <Link to={Links.TRANSFER()}>{t('Redeem')}</Link>
    </div>
  );
};

const ActivityStreak = () => {
  return <div>ActivityStreak</div>;
};
