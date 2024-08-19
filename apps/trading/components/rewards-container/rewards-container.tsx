import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';
import type { Account } from '@vegaprotocol/accounts';
import { normalizeTransfer, useAccounts } from '@vegaprotocol/accounts';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { AccountType } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import {
  Card,
  CardStat,
  CardTable,
  CardTableTD,
  CardTableTH,
} from '../card/card';
import {
  type RewardsPageQuery,
  useRewardsPageQuery,
  useRewardsEpochQuery,
} from '../../lib/hooks/__generated__/Rewards';
import {
  Tooltip,
  Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { formatPercentage } from '../fees-container/utils';
import {
  addDecimal,
  addDecimalsFormatNumberQuantum,
} from '@vegaprotocol/utils';
import { RewardsHistoryContainer } from './rewards-history';
import { useT } from '../../lib/use-t';
import {
  type AssetFieldsFragment,
  useAssetsMapProvider,
} from '@vegaprotocol/assets';
import { ActiveRewards } from './active-rewards';
import { ActivityStreak } from './streaks/activity-streaks';
import { RewardHoarderBonus } from './streaks/reward-hoarder-bonus';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

const ASSETS_WITH_INCORRECT_VESTING_REWARD_DATA = [
  'bf1e88d19db4b3ca0d1d5bdb73718a01686b18cf731ca26adedf3c8b83802bba', // USDT mainnet
  '8ba0b10971f0c4747746cd01ff05a53ae75ca91eba1d4d050b527910c983e27e', // USDT testnet
];

export const RewardsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.reward_asset,
    NetworkParams.rewards_activityStreak_benefitTiers,
    NetworkParams.rewards_vesting_benefitTiers,
    NetworkParams.rewards_vesting_baseRate,
  ]);

  const { data: accounts, loading: accountsLoading } = useAccounts(pubKey);

  const { data: assetMap } = useAssetsMapProvider();

  const { data: epochData } = useRewardsEpochQuery();

  const { rewards_activityStreak_benefitTiers, rewards_vesting_benefitTiers } =
    params || {};

  const activityStreakBenefitTiers = JSON.parse(
    rewards_activityStreak_benefitTiers
  );
  const vestingBenefitTiers = JSON.parse(rewards_vesting_benefitTiers);

  // No need to specify the fromEpoch as it will by default give you the last
  // Note activityStreak in query will fail
  const { data: rewardsData, loading: rewardsLoading } = useRewardsPageQuery({
    variables: {
      partyId: pubKey || '',
    },
    // Inclusion of activity streak in query currently fails
    errorPolicy: 'ignore',
    // polling here so that as rewards are are moved to ACCOUNT_TYPE_VESTED_REWARDS the vesting stats information stays
    // almost up to sync with accounts updating from subscriptions. There is a chance the data could be out
    // of sync for 10s if you happen to be on the page at the end of an epoch
    pollInterval: 10000,
  });

  const partyActivityStreak = rewardsData?.party?.activityStreak;
  const vestingDetails = rewardsData?.party?.vestingStats;

  if (!epochData?.epoch || !assetMap) return null;

  const loading = paramsLoading || accountsLoading || rewardsLoading;

  const rewardAccounts = accounts
    ? accounts
        .filter((a) =>
          [
            AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
            AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
          ].includes(a.type)
        )
        .filter((a) => new BigNumber(a.balance).isGreaterThan(0))
    : [];

  const rewardAccountsAssetMap = groupBy(rewardAccounts, 'asset.id');

  const lockedBalances = rewardsData?.party?.vestingBalancesSummary
    .lockedBalances
    ? rewardsData.party.vestingBalancesSummary.lockedBalances.filter((b) =>
        new BigNumber(b.balance).isGreaterThan(0)
      )
    : [];
  const lockedAssetMap = groupBy(lockedBalances, 'asset.id');

  const vestingBalances = rewardsData?.party?.vestingBalancesSummary
    .vestingBalances
    ? rewardsData.party.vestingBalancesSummary.vestingBalances.filter((b) =>
        new BigNumber(b.balance).isGreaterThan(0)
      )
    : [];
  const vestingAssetMap = groupBy(vestingBalances, 'asset.id');

  // each asset reward pot is made up of:
  // available to withdraw - ACCOUNT_TYPE_VESTED_REWARDS
  // vesting               - vestingBalancesSummary.vestingBalances
  // locked                - vestingBalancesSummary.lockedBalances
  //
  // there can be entires for the same asset in each list so we need a uniq list of assets
  const assets = uniq([
    ...Object.keys(rewardAccountsAssetMap),
    ...Object.keys(lockedAssetMap),
    ...Object.keys(vestingAssetMap),
  ]);

  return (
    <>
      <section className="grid auto-rows-min grid-cols-6 gap-3">
        {/* Always show reward information for vega */}
        <Card
          key={params.reward_asset}
          title={t('Vega Reward pot')}
          className="lg:col-span-3 xl:col-span-2"
          loading={loading}
          variant="hot"
        >
          <RewardPot
            pubKey={pubKey}
            accounts={accounts}
            assetId={params.reward_asset}
            vestingBalancesSummary={rewardsData?.party?.vestingBalancesSummary}
          />
        </Card>
        <Card
          title={t('Vesting')}
          className="lg:col-span-3 xl:col-span-2"
          loading={loading}
        >
          <Vesting
            pubKey={pubKey}
            baseRate={params.rewards_vesting_baseRate}
            multiplier={
              rewardsData?.party?.activityStreak?.rewardVestingMultiplier
            }
          />
        </Card>
        <Card
          title={t('Rewards multipliers')}
          className="lg:col-span-3 xl:col-span-2"
          loading={loading}
          variant="hot"
        >
          <Multipliers
            pubKey={pubKey}
            hoarderMultiplier={
              rewardsData?.party?.vestingStats?.rewardBonusMultiplier
            }
            streakMultiplier={
              rewardsData?.party?.activityStreak?.rewardDistributionMultiplier
            }
          />
        </Card>

        {/* Show all other reward pots, most of the time users will not have other rewards */}
        {assets
          .filter((assetId) => assetId !== params.reward_asset)
          .map((assetId) => {
            const asset = assetMap ? assetMap[assetId] : null;

            if (!asset) return null;

            // Following code is for mitigating an issue due to a core bug where locked and vesting
            // balances were incorrectly increased for infrastructure rewards for USDT on mainnet
            //
            // We don't want to incorrectly show the wring locked/vesting values, but we DO want to
            // show the user that they have rewards available to withdraw
            if (ASSETS_WITH_INCORRECT_VESTING_REWARD_DATA.includes(asset.id)) {
              const accountsForAsset = rewardAccountsAssetMap[asset.id];
              const vestedAccount = accountsForAsset?.find(
                (a) => a.type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS
              );

              // No vested rewards available to withdraw, so skip over USDT
              if (!vestedAccount || Number(vestedAccount.balance) <= 0) {
                return null;
              }

              return (
                <Card
                  key={assetId}
                  title={t('{{assetSymbol}} Reward pot', {
                    assetSymbol: asset.symbol,
                  })}
                  className="lg:col-span-3 xl:col-span-2"
                  loading={loading}
                >
                  <RewardPot
                    pubKey={pubKey}
                    accounts={accounts}
                    assetId={assetId}
                    // Ensure that these values are shown as 0
                    vestingBalancesSummary={{
                      lockedBalances: [],
                      vestingBalances: [],
                    }}
                  />
                </Card>
              );
            }

            return (
              <Card
                key={assetId}
                title={t('{{assetSymbol}} Reward pot', {
                  assetSymbol: asset.symbol,
                })}
                className="lg:col-span-3 xl:col-span-2"
                loading={loading}
              >
                <RewardPot
                  pubKey={pubKey}
                  accounts={accounts}
                  assetId={assetId}
                  vestingBalancesSummary={
                    rewardsData?.party?.vestingBalancesSummary
                  }
                />
              </Card>
            );
          })}
      </section>
      <section className="hidden md:flex flex-col gap-2">
        <h3>{t('Rewards history')}</h3>
        <RewardsHistoryContainer
          epoch={Number(epochData?.epoch.id)}
          pubKey={pubKey}
          assets={assetMap}
        />
      </section>
      <section className="hidden md:grid auto-rows-min grid-cols-6 gap-3">
        {pubKey && activityStreakBenefitTiers.tiers?.length > 0 && (
          <Card
            title={t('Activity Streak')}
            className={cn({
              'lg:col-span-6 xl:col-span-3':
                activityStreakBenefitTiers.tiers.length <= 4,
              'xl:col-span-6': activityStreakBenefitTiers.tiers.length > 4,
            })}
          >
            <span className="flex flex-col mr-8 pr-4">
              <ActivityStreak
                tiers={activityStreakBenefitTiers.tiers}
                streak={partyActivityStreak}
              />
            </span>
          </Card>
        )}
        {pubKey && vestingBenefitTiers.tiers?.length > 0 && (
          <Card
            title={t('Reward Hoarder Bonus')}
            className={cn({
              'lg:col-span-6 xl:col-span-3':
                vestingBenefitTiers.tiers.length <= 4,
              'xl:col-span-6': vestingBenefitTiers.tiers.length > 4,
            })}
          >
            <span className="flex flex-col mr-8 pr-4">
              <RewardHoarderBonus
                tiers={vestingBenefitTiers.tiers}
                vestingDetails={vestingDetails}
              />
            </span>
          </Card>
        )}
      </section>
      <section className="flex flex-col gap-2">
        <ActiveRewards currentEpoch={Number(epochData?.epoch.id)} />
      </section>
    </>
  );
};

export type VestingBalances = NonNullable<
  RewardsPageQuery['party']
>['vestingBalancesSummary'];

export type RewardPotProps = {
  pubKey: string | undefined;
  accounts: Account[] | null;
  assetId: string; // VEGA
  vestingBalancesSummary: VestingBalances | undefined;
};

export const RewardPot = ({
  pubKey,
  accounts,
  assetId,
  vestingBalancesSummary,
}: RewardPotProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);

  // All vested rewards accounts
  const availableRewardAssetAccounts = accounts
    ? accounts.filter((a) => {
        return (
          a.asset.id === assetId &&
          a.type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS
        );
      })
    : [];

  // Sum of all vested reward account balances
  const totalVestedRewardsByRewardAsset = BigNumber.sum.apply(
    null,
    availableRewardAssetAccounts.length
      ? availableRewardAssetAccounts.map((a) => a.balance)
      : [0]
  );

  const lockedEntries = vestingBalancesSummary?.lockedBalances?.filter(
    (b) => b.asset.id === assetId
  );
  const lockedBalances = lockedEntries?.length
    ? lockedEntries.map((e) => e.balance)
    : [0];
  const totalLocked = BigNumber.sum.apply(null, lockedBalances);

  const vestingEntries = vestingBalancesSummary?.vestingBalances?.filter(
    (b) => b.asset.id === assetId
  );
  const vestingBalances = vestingEntries?.length
    ? vestingEntries.map((e) => e.balance)
    : [0];
  const totalVesting = BigNumber.sum.apply(null, vestingBalances);

  const totalRewards = totalLocked
    .plus(totalVesting)
    .plus(totalVestedRewardsByRewardAsset);

  let rewardAsset: AssetFieldsFragment | undefined = undefined;

  if (availableRewardAssetAccounts.length) {
    rewardAsset = availableRewardAssetAccounts[0].asset;
  } else if (lockedEntries?.length) {
    rewardAsset = lockedEntries[0].asset;
  } else if (vestingEntries?.length) {
    rewardAsset = vestingEntries[0].asset;
  }

  if (!pubKey) {
    return (
      <div className="pt-4">
        <p className="text-sm">{t('Not connected')}</p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {rewardAsset ? (
        <>
          <CardStat
            value={`${addDecimalsFormatNumberQuantum(
              totalRewards.toString(),
              rewardAsset.decimals,
              rewardAsset.quantum
            )} ${rewardAsset.symbol}`}
            testId="total-rewards"
          />
          <div className="flex flex-col gap-4">
            <CardTable>
              <tr>
                <CardTableTH className="flex items-center gap-1">
                  {t('Locked {{assetSymbol}}', {
                    assetSymbol: rewardAsset.symbol,
                  })}
                  <VegaIcon name={VegaIconNames.LOCK} size={12} />
                </CardTableTH>
                <CardTableTD data-testid="locked-value">
                  {addDecimalsFormatNumberQuantum(
                    totalLocked.toString(),
                    rewardAsset.decimals,
                    rewardAsset.quantum
                  )}
                </CardTableTD>
              </tr>
              <tr>
                <CardTableTH>
                  {t('Vesting {{assetSymbol}}', {
                    assetSymbol: rewardAsset.symbol,
                  })}
                </CardTableTH>
                <CardTableTD data-testid="vesting-value">
                  {addDecimalsFormatNumberQuantum(
                    totalVesting.toString(),
                    rewardAsset.decimals,
                    rewardAsset.quantum
                  )}
                </CardTableTD>
              </tr>
              <tr>
                <CardTableTH>
                  {t('Available to withdraw this epoch')}
                </CardTableTH>
                <CardTableTD data-testid="available-to-withdraw-value">
                  {addDecimalsFormatNumberQuantum(
                    totalVestedRewardsByRewardAsset.toString(),
                    rewardAsset.decimals,
                    rewardAsset.quantum
                  )}
                </CardTableTD>
              </tr>
            </CardTable>
            {totalVestedRewardsByRewardAsset.isGreaterThan(0) && (
              <div>
                <Tooltip
                  description={t(
                    'Click to move all vested rewards for this key into its general account'
                  )}
                >
                  <Button
                    onClick={() => {
                      if (!rewardAsset) return;
                      const transfer = normalizeTransfer(
                        pubKey,
                        addDecimal(
                          totalVestedRewardsByRewardAsset.toString(),
                          rewardAsset.decimals
                        ),
                        AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
                        AccountType.ACCOUNT_TYPE_GENERAL,
                        rewardAsset
                      );
                      create({ transfer });
                    }}
                    size="sm"
                    data-testid="redeem-rewards-button"
                  >
                    {t('Redeem rewards')}
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-surface-2-fg-muted text-sm">{t('No rewards')}</p>
      )}
    </div>
  );
};

export const Vesting = ({
  pubKey,
  baseRate,
  multiplier,
}: {
  pubKey: string | undefined;
  baseRate: string;
  multiplier?: string;
}) => {
  const t = useT();
  const rate = new BigNumber(baseRate).times(multiplier || 1);
  const rateFormatted = formatPercentage(Number(rate));
  const baseRateFormatted = formatPercentage(Number(baseRate));

  return (
    <div className="pt-4">
      <CardStat value={rateFormatted + '%'} testId="vesting-rate" />
      <CardTable>
        <tr>
          <CardTableTH>{t('Base rate')}</CardTableTH>
          <CardTableTD data-testid="base-rate-value">
            {baseRateFormatted}%
          </CardTableTD>
        </tr>
        {pubKey && (
          <tr>
            <CardTableTH>{t('Vesting multiplier')}</CardTableTH>
            <CardTableTD data-testid="vesting multiplier-value">
              {multiplier ? `${multiplier}x` : '-'}
            </CardTableTD>
          </tr>
        )}
      </CardTable>
    </div>
  );
};

export const Multipliers = ({
  pubKey,
  streakMultiplier,
  hoarderMultiplier,
}: {
  pubKey: string | undefined;
  streakMultiplier?: string;
  hoarderMultiplier?: string;
}) => {
  const t = useT();
  const combinedMultiplier = new BigNumber(streakMultiplier || 1).times(
    hoarderMultiplier || 1
  );

  if (!pubKey) {
    return (
      <div className="pt-4">
        <p className="text-surface-2-fg-muted text-sm">{t('Not connected')}</p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <CardStat
        value={combinedMultiplier.toString() + 'x'}
        testId="combined-multipliers"
        highlight={true}
      />
      <CardTable>
        <tr>
          <CardTableTH>{t('Streak reward multiplier')}</CardTableTH>
          <CardTableTD data-testid="streak-reward-multiplier-value">
            {streakMultiplier ? `${streakMultiplier}x` : '-'}
          </CardTableTD>
        </tr>
        <tr>
          <CardTableTH>{t('Hoarder reward multiplier')}</CardTableTH>
          <CardTableTD data-testid="hoarder-reward-multiplier-value">
            {hoarderMultiplier ? `${hoarderMultiplier}x` : '-'}
          </CardTableTD>
        </tr>
      </CardTable>
    </div>
  );
};
