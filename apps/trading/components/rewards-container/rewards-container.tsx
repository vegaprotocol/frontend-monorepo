import type { Account } from '@vegaprotocol/accounts';
import { useAccounts } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { AccountType } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Links } from '../../lib/links';
import BigNumber from 'bignumber.js';
import { Link } from 'react-router-dom';
import {
  Card,
  CardStat,
  CardTable,
  CardTableTD,
  CardTableTH,
} from '../card/card';
import { getQuantumValue } from '@vegaprotocol/assets';
import { useRewardsPageQuery } from './__generated__/Rewards';
import {
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { formatPercentage } from '../fees-container/utils';

const REWARD_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
  AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
];

export const RewardsContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.reward_asset,
    NetworkParams.rewards_activityStreak_benefitTiers,
    NetworkParams.rewards_vesting_baseRate,
  ]);
  const { data: accounts, loading: accountsLoading } = useAccounts(pubKey);
  const { data: rewardsData, loading: rewardsLoading } = useRewardsPageQuery({
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
  });

  const loading = paramsLoading || accountsLoading || rewardsLoading;

  return (
    <div className="p-4">
      <h3 className="mb-4">Rewards</h3>
      <div className="grid auto-rows-min grid-cols-6 gap-3">
        <Card
          title={t('Reward pot')}
          className="lg:col-span-2"
          loading={loading}
        >
          <RewardPot accounts={accounts} rewardAssetId={params.reward_asset} />
        </Card>
        <Card title={t('Vesting')} className="lg:col-span-2" loading={loading}>
          <Vesting baseRate={params.rewards_vesting_baseRate} />
        </Card>
        <Card
          title={t('Rewards multipliers')}
          className="lg:col-span-2"
          loading={loading}
        >
          <Multipliers />
        </Card>
        {/*
        <Card title={t('Activity streak')} className="lg:col-span-3">
          TODO:
        </Card>
        <Card title={t('Reward hoarder bonus')} className="lg:col-span-3">
          TODO:
        </Card>
        */}
        <Card title={t('Rewards history')} className="lg:col-span-full">
          TODO:
        </Card>
      </div>
    </div>
  );
};

export const RewardPot = ({
  accounts,
  rewardAssetId,
}: {
  accounts: Account[] | null;
  rewardAssetId: string; // VEGA
}) => {
  const rewardAccounts = accounts
    ? accounts.filter((a) => REWARD_ACCOUNT_TYPES.includes(a.type))
    : [];

  const totalRewards = BigNumber.sum.apply(
    null,
    rewardAccounts.length
      ? rewardAccounts.map((a) => getQuantumValue(a.balance, a.asset.quantum))
      : [0]
  );

  const rewardAssetAccounts = accounts
    ? accounts.filter((a) => {
        return a.asset.id === rewardAssetId;
      })
    : [];

  const vestedRewardAssetAccounts = rewardAssetAccounts.filter(
    (a) => a.type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS
  );

  const vestingRewardAssetAccounts = rewardAssetAccounts.filter(
    (a) => a.type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS
  );

  const totalVestedRewardsByRewardAsset = BigNumber.sum.apply(
    null,
    vestedRewardAssetAccounts.length
      ? vestedRewardAssetAccounts.map((a) => a.balance)
      : [0]
  );

  const totalVestingRewardsByRewardAsset = BigNumber.sum.apply(
    null,
    vestingRewardAssetAccounts.length
      ? vestingRewardAssetAccounts.map((a) => a.balance)
      : [0]
  );

  const totalRewardAsset = totalVestedRewardsByRewardAsset.plus(
    totalVestingRewardsByRewardAsset
  );

  return (
    <div>
      <div className="flex justify-between">
        <CardStat
          value={
            <p data-testid="total-rewards">
              {totalRewardAsset.toString()} {t('VEGA')}
            </p>
          }
        />
        <CardStat
          value={
            <p data-testid="total-rewards">
              {totalRewards.toString()} {t('qUSD')}
            </p>
          }
        />
      </div>
      <div className="flex flex-col gap-4">
        <CardTable>
          <tr>
            <CardTableTH>
              <span className="flex items-center gap-1">
                {t('Locked VEGA')}
                <VegaIcon name={VegaIconNames.LOCK} size={12} />
              </span>
            </CardTableTH>
            <CardTableTD>FOO</CardTableTD>
          </tr>
          <tr>
            <CardTableTH>{t('Vesting VEGA')}</CardTableTH>
            <CardTableTD>
              {totalVestingRewardsByRewardAsset.toString()}
            </CardTableTD>
          </tr>
          <tr>
            <CardTableTH>{t('Available to withdraw this epoch')}</CardTableTH>
            <CardTableTD>
              {totalVestedRewardsByRewardAsset.toString()}
            </CardTableTD>
          </tr>
        </CardTable>
        <Link to={Links.TRANSFER()}>
          <TradingButton size="small">{t('Redeem')}</TradingButton>
        </Link>
      </div>
    </div>
  );
};

const Vesting = ({ baseRate }: { baseRate: string }) => {
  const baseRateFormatted = formatPercentage(Number(baseRate));
  return (
    <div>
      <CardStat value={baseRateFormatted + '%'} />
      <CardTable>
        <tr>
          <CardTableTH>{t('Base rate')}</CardTableTH>
          <CardTableTD>{baseRateFormatted}%</CardTableTD>
        </tr>
        <tr>
          <CardTableTH>{t('Vesting multiplier')}</CardTableTH>
          <CardTableTD>0%</CardTableTD>
        </tr>
        <tr>
          <CardTableTH>{t('Available to withdraw next epoch')}</CardTableTH>
          <CardTableTD>0%</CardTableTD>
        </tr>
      </CardTable>
    </div>
  );
};

const Multipliers = () => {
  return (
    <div>
      <p className="text-sm text-muted">{t('No active reward bonuses')}</p>
    </div>
  );
};
