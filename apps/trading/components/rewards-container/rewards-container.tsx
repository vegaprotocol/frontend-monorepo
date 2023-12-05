import groupBy from 'lodash/groupBy';
import type { Account } from '@vegaprotocol/accounts';
import { useAccounts } from '@vegaprotocol/accounts';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { AccountType } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
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
} from './__generated__/Rewards';
import {
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { formatPercentage } from '../fees-container/utils';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { RewardsHistoryContainer } from './rewards-history';
import { useT } from '../../lib/use-t';

export const RewardsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.reward_asset,
    NetworkParams.rewards_activityStreak_benefitTiers,
    NetworkParams.rewards_vesting_baseRate,
  ]);
  const { data: accounts, loading: accountsLoading } = useAccounts(pubKey);

  const { data: epochData } = useRewardsEpochQuery();

  // No need to specify the fromEpoch as it will by default give you the last
  const { data: rewardsData, loading: rewardsLoading } = useRewardsPageQuery({
    variables: {
      partyId: pubKey || '',
    },
  });

  if (!epochData?.epoch) return null;

  const loading = paramsLoading || accountsLoading || rewardsLoading;

  const rewardAccounts = accounts
    ? accounts.filter((a) =>
        [
          AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
          AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
        ].includes(a.type)
      )
    : [];

  const rewardAssetsMap = groupBy(
    rewardAccounts.filter((a) => a.asset.id !== params.reward_asset),
    'asset.id'
  );

  return (
    <div className="grid auto-rows-min grid-cols-6 gap-3">
      {/* Always show reward information for vega */}
      <Card
        key={params.reward_asset}
        title={t('Vega Reward pot')}
        className="lg:col-span-3 xl:col-span-2"
        loading={loading}
        highlight={true}
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
        highlight={true}
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
      {Object.keys(rewardAssetsMap).map((assetId) => {
        const asset = rewardAssetsMap[assetId][0].asset;
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
      <Card
        title={t('Rewards history')}
        className="lg:col-span-full"
        loading={rewardsLoading}
      >
        <RewardsHistoryContainer
          epoch={Number(epochData?.epoch.id)}
          pubKey={pubKey}
        />
      </Card>
    </div>
  );
};

type VestingBalances = NonNullable<
  RewardsPageQuery['party']
>['vestingBalancesSummary'];

export type RewardPotProps = {
  pubKey: string | null;
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
  // TODO: Opening the sidebar for the first time works, but then clicking on redeem
  // for a different asset does not update the form
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);

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

  const totalRewards = totalLocked.plus(totalVesting);

  let rewardAsset = undefined;

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
        <p className="text-muted text-sm">{t('Not connected')}</p>
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
                <CardTableTD>
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
                <CardTableTD>
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
                <CardTableTD>
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
                <TradingButton
                  onClick={() =>
                    setViews(
                      { type: ViewType.Transfer, assetId },
                      currentRouteId
                    )
                  }
                  size="small"
                >
                  {t('Redeem rewards')}
                </TradingButton>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted text-sm">{t('No rewards')}</p>
      )}
    </div>
  );
};

export const Vesting = ({
  pubKey,
  baseRate,
  multiplier = '1',
}: {
  pubKey: string | null;
  baseRate: string;
  multiplier?: string;
}) => {
  const t = useT();
  const rate = new BigNumber(baseRate).times(multiplier);
  const rateFormatted = formatPercentage(Number(rate));
  const baseRateFormatted = formatPercentage(Number(baseRate));

  return (
    <div className="pt-4">
      <CardStat value={rateFormatted + '%'} testId="vesting-rate" />
      <CardTable>
        <tr>
          <CardTableTH>{t('Base rate')}</CardTableTH>
          <CardTableTD>{baseRateFormatted}%</CardTableTD>
        </tr>
        {pubKey && (
          <tr>
            <CardTableTH>{t('Vesting multiplier')}</CardTableTH>
            <CardTableTD>{multiplier}x</CardTableTD>
          </tr>
        )}
      </CardTable>
    </div>
  );
};

export const Multipliers = ({
  pubKey,
  streakMultiplier = '1',
  hoarderMultiplier = '1',
}: {
  pubKey: string | null;
  streakMultiplier?: string;
  hoarderMultiplier?: string;
}) => {
  const t = useT();
  const combinedMultiplier = new BigNumber(streakMultiplier).times(
    hoarderMultiplier
  );

  if (!pubKey) {
    return (
      <div className="pt-4">
        <p className="text-muted text-sm">{t('Not connected')}</p>
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
          <CardTableTD>{streakMultiplier}x</CardTableTD>
        </tr>
        <tr>
          <CardTableTH>{t('Hoarder reward multiplier')}</CardTableTH>
          <CardTableTD>{hoarderMultiplier}x</CardTableTD>
        </tr>
      </CardTable>
    </div>
  );
};
