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
import {
  type AssetFieldsFragment,
  getQuantumValue,
  useAssetsMapProvider,
} from '@vegaprotocol/assets';
import {
  type RewardsPageQuery,
  useRewardsPageEpochQuery,
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
import { type ColDef } from 'ag-grid-community';
import {
  addDecimalsFormatNumberQuantum,
  formatNumberPercentage,
} from '@vegaprotocol/utils';

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

  const { data: epochData } = useRewardsPageEpochQuery();

  const { data: rewardsData, loading: rewardsLoading } = useRewardsPageQuery({
    variables: {
      partyId: pubKey || '',
      epochRewardSummariesFilter: {
        // TODO: remove these hard coded values
        fromEpoch: 9799, // Number(epochData?.epoch.id || 1) - 1,
        toEpoch: 9799,
      },
    },
    skip: !pubKey || !epochData?.epoch.id,
  });

  const { data: assets } = useAssetsMapProvider();

  const loading = paramsLoading || accountsLoading || rewardsLoading;

  // TODO: Fix grid rows, they break on small screens when things stack
  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="mb-4">Rewards</h3>
      <div className="flex-1 grid auto-rows-min grid-cols-6 gap-3">
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
          <RewardHistory
            epochRewardSummaries={rewardsData?.epochRewardSummaries}
            assets={assets}
          />
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
    <div className="pt-4">
      <div className="flex justify-between">
        <CardStat
          value={
            <span data-testid="total-rewards">
              {totalRewardAsset.toString()} {t('VEGA')}
            </span>
          }
        />
        <CardStat
          value={
            <span data-testid="total-rewards">
              {totalRewards.toString()}{' '}
              <span className="calt">{t('qUSD')}</span>
            </span>
          }
        />
      </div>
      <div className="flex flex-col gap-4">
        <CardTable>
          <tr>
            <CardTableTH>
              <span className="flex items-center gap-1">
                {t('Vesting VEGA')}
                <VegaIcon name={VegaIconNames.LOCK} size={12} />
              </span>
            </CardTableTH>
            <CardTableTD>
              {totalVestingRewardsByRewardAsset.toString()}
            </CardTableTD>
          </tr>
          <tr>
            <CardTableTH>{t('Vested VEGA')}</CardTableTH>
            <CardTableTD>
              {totalVestedRewardsByRewardAsset.toString()}
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
    const rewardValueFormatter = ({
      data,
      value,
    }: {
      data: RewardRow;
      value: number;
    }) => {
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
      if (value <= 0) {
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
