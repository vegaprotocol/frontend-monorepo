// TODO:
// - Rewards history toggle for switching between user and all rewards
// - Verify data in top cards is correct

import groupBy from 'lodash/groupBy';
import compact from 'lodash/compact';
import type { Account } from '@vegaprotocol/accounts';
import { useAccounts } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/i18n';
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
  type AssetFieldsFragment,
  useAssetsMapProvider,
} from '@vegaprotocol/assets';
import {
  type RewardsPageQuery,
  useRewardsPageQuery,
  useRewardsEpochQuery,
} from './__generated__/Rewards';
import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { formatPercentage } from '../fees-container/utils';
import { AgGrid, StackedCell } from '@vegaprotocol/datagrid';
import { useMemo, useState } from 'react';
import type { ValueFormatterFunc } from 'ag-grid-community';
import { type ColDef } from 'ag-grid-community';
import {
  addDecimalsFormatNumberQuantum,
  formatNumberPercentage,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import classNames from 'classnames';

export const RewardsContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.reward_asset,
    NetworkParams.rewards_activityStreak_benefitTiers,
    NetworkParams.rewards_vesting_baseRate,
  ]);
  const { data: accounts, loading: accountsLoading } = useAccounts(pubKey);

  const { data: epochData } = useRewardsEpochQuery();

  const fromEpoch = Number(epochData?.epoch.id) - 1000;
  const toEpoch = Number(epochData?.epoch.id) - 1;

  // No need to specify the fromEpoch as it will by default give you the last
  const { data: rewardsData, loading: rewardsLoading } = useRewardsPageQuery({
    variables: {
      partyId: pubKey || '',
      fromEpoch,
      toEpoch,
    },
    skip: !pubKey || !epochData?.epoch.id,
  });

  const { data: assets, loading: assetsLoading } = useAssetsMapProvider();

  const loading =
    paramsLoading || accountsLoading || rewardsLoading || assetsLoading;

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

  // TODO: Fix grid rows, they break on small screens when things stack
  return (
    <div className="grid auto-rows-min grid-cols-6 gap-3">
      {/* Always show the rewards pot for the reward asset AKA Vega */}
      <Card
        key={params.reward_asset}
        title={t('Vega Reward pot')}
        className="lg:col-span-2"
        loading={loading}
        highlight={true}
      >
        <RewardPot
          accounts={accounts}
          assetId={params.reward_asset}
          vestingBalancesSummary={rewardsData?.party?.vestingBalancesSummary}
        />
      </Card>

      {/* Show all other rewards */}
      {Object.keys(rewardAssetsMap).map((assetId) => {
        const asset = rewardAssetsMap[assetId][0].asset;
        return (
          <Card
            key={assetId}
            title={t('%s Reward pot', asset.symbol)}
            className="lg:col-span-2"
            loading={loading}
          >
            <RewardPot
              accounts={accounts}
              assetId={assetId}
              vestingBalancesSummary={
                rewardsData?.party?.vestingBalancesSummary
              }
            />
          </Card>
        );
      })}
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
      <Card
        title={t('Rewards history')}
        className="lg:col-span-full"
        loading={loading}
      >
        <RewardHistory
          epochRewardSummaries={rewardsData?.epochRewardSummaries}
          partyRewards={rewardsData?.party?.rewardsConnection}
          assets={assets}
          partyId={pubKey}
          fromEpoch={fromEpoch}
          toEpoch={toEpoch}
        />
      </Card>
    </div>
  );
};

type VestingBalances = NonNullable<
  RewardsPageQuery['party']
>['vestingBalancesSummary'];

export type RewardPotProps = {
  accounts: Account[] | null;
  assetId: string; // VEGA
  vestingBalancesSummary: VestingBalances | undefined;
};

export const RewardPot = ({
  accounts,
  assetId,
  vestingBalancesSummary,
}: RewardPotProps) => {
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
                  {t(`Locked ${rewardAsset.symbol}`)}
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
                <CardTableTH>{t(`Vesting ${rewardAsset.symbol}`)}</CardTableTH>
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
            <div>
              <TradingButton
                onClick={() =>
                  setViews({ type: ViewType.Transfer, assetId }, currentRouteId)
                }
                size="small"
              >
                {t('Redeem rewards')}
              </TradingButton>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">{t('No rewards')}</p>
      )}
    </div>
  );
};

export const Vesting = ({ baseRate }: { baseRate: string }) => {
  const baseRateFormatted = formatPercentage(Number(baseRate));
  return (
    <div className="pt-4">
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
          <CardTableTD>0</CardTableTD>
        </tr>
      </CardTable>
    </div>
  );
};

const Multipliers = () => {
  return (
    <div className="pt-4">
      <p className="text-sm text-muted">{t('No active reward bonuses')}</p>
    </div>
  );
};

const defaultColDef = {
  flex: 1,
  resizable: true,
  sortable: true,
};

interface RewardRow {
  asset: AssetFieldsFragment;
  staking: number;
  priceTaking: number;
  priceMaking: number;
  liquidityProvision: number;
  marketCreation: number;
  averagePosition: number;
  relativeReturns: number;
  returnsVolatility: number;
  validatorRanking: number;
  total: number;
}

type PartyRewardsConnection = NonNullable<
  RewardsPageQuery['party']
>['rewardsConnection'];

export const RewardHistory = ({
  epochRewardSummaries,
  partyRewards,
  assets,
  partyId,
  fromEpoch,
  toEpoch,
}: {
  epochRewardSummaries: RewardsPageQuery['epochRewardSummaries'];
  partyRewards: PartyRewardsConnection;
  assets: Record<string, AssetFieldsFragment> | null;
  partyId: string | null;
  fromEpoch: number;
  toEpoch: number;
}) => {
  const [isParty, setIsParty] = useState(false);

  const rowData = useRowData({
    epochRewardSummaries,
    partyRewards,
    assets,
    partyId: isParty ? partyId : null,
  });

  const columnDefs = useMemo<ColDef<RewardRow>[]>(() => {
    const rewardValueFormatter: ValueFormatterFunc<RewardRow> = ({
      data,
      value,
    }) => {
      if (!value || !data) {
        return '-';
      }
      return addDecimalsFormatNumberQuantum(
        value,
        data.asset.decimals,
        data.asset.quantum
      );
    };

    const rewardCellRenderer = ({
      data,
      value,
      valueFormatted,
    }: {
      data: RewardRow;
      value: number;
      valueFormatted: string;
    }) => {
      if (!value || value <= 0 || !data) {
        return <span className="text-muted">-</span>;
      }

      const pctOfTotal = new BigNumber(value).dividedBy(data.total).times(100);

      return (
        <StackedCell
          primary={valueFormatted}
          secondary={formatNumberPercentage(pctOfTotal, 2)}
        />
      );
    };

    const colDefs: ColDef[] = [
      {
        field: 'asset.symbol',
        cellRenderer: ({ value, data }: { value: string; data: RewardRow }) => {
          if (!value || !data) return <span>-</span>;
          return <StackedCell primary={value} secondary={data.asset.name} />;
        },
      },
      {
        field: 'staking',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'priceTaking',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'priceMaking',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'liquidityProvision',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'marketCreation',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'averagePosition',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'relativeReturns',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'returnsVolatility',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'validatorRanking',
        valueFormatter: rewardValueFormatter,
        cellRenderer: rewardCellRenderer,
      },
      {
        field: 'total',
        type: 'rightAligned',
        valueFormatter: rewardValueFormatter,
      },
    ];
    return colDefs;
  }, []);

  return (
    <div>
      <div className="flex justify-between gap-2 items-center mb-2">
        <h4 className="text-muted text-xs">
          From {fromEpoch} to {toEpoch}
        </h4>
        <div className="flex gap-2">
          <TradingButton
            onClick={() => setIsParty(false)}
            size="extra-small"
            className={classNames({
              'bg-transparent dark:bg-transparent': isParty,
            })}
          >
            {t('Total distributed')}
          </TradingButton>
          <TradingButton
            onClick={() => setIsParty(true)}
            size="extra-small"
            className={classNames({
              'bg-transparent dark:bg-transparent': !isParty,
            })}
          >
            {t('Earned by me')}
          </TradingButton>
        </div>
      </div>
      <AgGrid
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={rowData}
        rowHeight={45}
        domLayout="autoHeight"
      />
    </div>
  );
};

const getPartyRewards = (
  rewards: Array<{
    rewardType: AccountType;
    assetId: string;
    amount: string;
  }>,
  assets: Record<string, AssetFieldsFragment> | null
) => {
  const assetMap = groupBy(rewards, 'assetId');

  return Object.keys(assetMap).map((assetId) => {
    const r = assetMap[assetId];
    const asset = assets ? assets[assetId] : undefined;

    const totals = new Map<AccountType, number>();

    const rewardAccountTypes = [
      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
      AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
      AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN,
      AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY,
      AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING,
    ];

    rewardAccountTypes.forEach((type) => {
      const amountsByType = r
        .filter((a) => a.rewardType === type)
        .map((a) => a.amount);
      const typeTotal = BigNumber.sum.apply(
        null,
        amountsByType.length ? amountsByType : [0]
      );

      totals.set(type, typeTotal.toNumber());
    });

    const total = BigNumber.sum.apply(
      null,
      Array.from(totals).map((entry) => entry[1])
    );

    return {
      asset,
      staking: totals.get(AccountType.ACCOUNT_TYPE_GLOBAL_REWARD),
      priceTaking: totals.get(AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES),
      priceMaking: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES
      ),
      liquidityProvision: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES
      ),
      marketCreation: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS
      ),
      averagePosition: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION
      ),
      relativeReturns: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN
      ),
      returnsVolatility: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY
      ),
      validatorRanking: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING
      ),
      total: total.toNumber(),
    };
  });
};

const useRowData = ({
  partyRewards,
  epochRewardSummaries,
  assets,
  partyId,
}: {
  partyRewards: PartyRewardsConnection;
  epochRewardSummaries: RewardsPageQuery['epochRewardSummaries'];
  assets: Record<string, AssetFieldsFragment> | null;
  partyId: string | null;
}) => {
  if (partyId) {
    const rewards = removePaginationWrapper(partyRewards?.edges).map((r) => ({
      rewardType: r.rewardType,
      assetId: r.asset.id,
      amount: r.amount,
    }));
    return getPartyRewards(rewards, assets);
  }

  const rewards = removePaginationWrapper(epochRewardSummaries?.edges);
  return getPartyRewards(rewards, assets);
};
