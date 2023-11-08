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
} from './__generated__/Rewards';
import {
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { formatPercentage } from '../fees-container/utils';
import { AgGrid, StackedCell } from '@vegaprotocol/datagrid';
import { useMemo } from 'react';
import type { ValueFormatterFunc } from 'ag-grid-community';
import { type ColDef } from 'ag-grid-community';
import {
  addDecimalsFormatNumberQuantum,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';

export const RewardsContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.reward_asset,
    NetworkParams.rewards_activityStreak_benefitTiers,
    NetworkParams.rewards_vesting_baseRate,
  ]);
  const { data: accounts, loading: accountsLoading } = useAccounts(pubKey);

  // No need to specify the fromEpoch as it will by default give you the last
  const { data: rewardsData, loading: rewardsLoading } = useRewardsPageQuery({
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
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
    <div className="flex flex-col h-full p-4">
      <h3 className="mb-4">Rewards</h3>
      <div className="flex-1 grid auto-rows-min grid-cols-6 gap-3">
        {/* Always show the rewards pot for the reward asset AKA Vega */}
        <Card
          key={params.reward_asset}
          title={t('Vega Reward pot')}
          className="lg:col-span-2"
          loading={loading}
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
            assets={assets}
          />
        </Card>
      </div>
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
                {t('Redeem')}
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

const Vesting = ({ baseRate }: { baseRate: string }) => {
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
          <CardTableTD>0%</CardTableTD>
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

const RewardHistory = ({
  epochRewardSummaries,
  assets,
}: {
  epochRewardSummaries: RewardsPageQuery['epochRewardSummaries'];
  assets: Record<string, AssetFieldsFragment> | null;
}) => {
  const nodes = epochRewardSummaries?.edges
    ? compact(epochRewardSummaries.edges).map((e) => e.node)
    : [];

  const byId = groupBy(nodes, 'assetId');

  const rowData = Object.keys(byId).map((assetId) => {
    const asset = assets ? assets[assetId] : undefined;
    const summaries = byId[assetId];

    const sumTypes = (type: AccountType) => {
      const accounts = summaries
        .filter((a) => a.rewardType === type)
        .map((a) => a.amount);

      return BigNumber.sum.apply(null, accounts.length ? accounts : [0]);
    };

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
      totals.set(type, sumTypes(type).toNumber());
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
      { field: 'asset.symbol' },
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
    <AgGrid
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      rowData={rowData}
      rowHeight={45}
      domLayout="autoHeight"
    />
  );
};
