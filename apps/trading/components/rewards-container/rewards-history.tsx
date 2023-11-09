import groupBy from 'lodash/groupBy';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import type { ColDef, ValueFormatterFunc } from 'ag-grid-community';
import {
  useAssetsMapProvider,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import {
  addDecimalsFormatNumberQuantum,
  formatNumberPercentage,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { AgGrid, StackedCell } from '@vegaprotocol/datagrid';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { AccountType } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import {
  useRewardsHistoryQuery,
  type RewardsHistoryQuery,
} from './__generated__/Rewards';

export const RewardsHistoryContainer = ({
  epoch,
  pubKey,
}: {
  pubKey: string | null;
  epoch: number;
}) => {
  const [epochVariables, setEpochVariables] = useState(() => ({
    from: epoch - 100,
    to: epoch,
  }));

  const { data: assets } = useAssetsMapProvider();

  // No need to specify the fromEpoch as it will by default give you the last
  const { refetch, data: rewardsData } = useRewardsHistoryQuery({
    variables: {
      partyId: pubKey || '',
      fromEpoch: epoch - 100,
      toEpoch: epoch,
    },
  });

  const debouncedRefetch = useMemo(
    () => debounce((variables) => refetch(variables), 400),
    [refetch]
  );

  const handleEpochChange = (x: { from?: number; to?: number }) => {
    setEpochVariables((curr) => ({
      ...curr,
      ...x,
    }));
    debouncedRefetch({
      partyId: pubKey || '',
      fromEpoch: x.from,
      toEpoch: x.to,
    });
  };

  return (
    <RewardHistory
      pubKey={pubKey}
      epochRewardSummaries={rewardsData?.epochRewardSummaries}
      partyRewards={rewardsData?.party?.rewardsConnection}
      onEpochChange={handleEpochChange}
      epochVariables={epochVariables}
      assets={assets}
    />
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
  RewardsHistoryQuery['party']
>['rewardsConnection'];

const RewardHistory = ({
  epochRewardSummaries,
  partyRewards,
  assets,
  pubKey,
  epochVariables,
  onEpochChange,
}: {
  epochRewardSummaries: RewardsHistoryQuery['epochRewardSummaries'];
  partyRewards: PartyRewardsConnection;
  assets: Record<string, AssetFieldsFragment> | null;
  pubKey: string | null;
  epochVariables: {
    from: number;
    to: number;
  };
  onEpochChange: (x: { from?: number; to?: number }) => void;
}) => {
  const [isParty, setIsParty] = useState(false);

  const rowData = useRowData({
    epochRewardSummaries,
    partyRewards,
    assets,
    partyId: isParty ? pubKey : null,
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
        sort: 'desc',
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
        <h4 className="text-muted text-xs flex items-center gap-2">
          {t('From epoch')}
          <span className="relative">
            <span className="py-2 px-1 opacity-0">{epochVariables.from}</span>
            <input
              onChange={(e) => onEpochChange({ from: Number(e.target.value) })}
              value={epochVariables.from}
              className="py-2 px-1 rounded absolute top-0 left-0 w-full h-full bg-vega-clight-600 dark:bg-vega-cdark-600"
            />
          </span>
          {t('to')}
          <span className="relative">
            <span className="py-2 px-1 opacity-0">{epochVariables.to}</span>
            <input
              onChange={(e) => onEpochChange({ to: Number(e.target.value) })}
              value={epochVariables.to}
              className="py-2 px-1 rounded absolute top-0 left-0 w-full h-full bg-vega-clight-600 dark:bg-vega-cdark-600"
            />
          </span>
        </h4>
        <div className="flex gap-0.5">
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
            disabled={!pubKey}
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

const REWARD_ACCOUNT_TYPES = [
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

const getRewards = (
  rewards: Array<{
    rewardType: AccountType;
    assetId: string;
    amount: string;
  }>,
  assets: Record<string, AssetFieldsFragment> | null
) => {
  const assetMap = groupBy(
    rewards.filter((r) => REWARD_ACCOUNT_TYPES.includes(r.rewardType)),
    'assetId'
  );

  return Object.keys(assetMap).map((assetId) => {
    const r = assetMap[assetId];
    const asset = assets ? assets[assetId] : undefined;

    const totals = new Map<AccountType, number>();

    REWARD_ACCOUNT_TYPES.forEach((type) => {
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
  epochRewardSummaries: RewardsHistoryQuery['epochRewardSummaries'];
  assets: Record<string, AssetFieldsFragment> | null;
  partyId: string | null;
}) => {
  if (partyId) {
    const rewards = removePaginationWrapper(partyRewards?.edges).map((r) => ({
      rewardType: r.rewardType,
      assetId: r.asset.id,
      amount: r.amount,
    }));
    return getRewards(rewards, assets);
  }

  const rewards = removePaginationWrapper(epochRewardSummaries?.edges);
  return getRewards(rewards, assets);
};
