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
} from '@vegaprotocol/utils';
import { AgGrid, StackedCell } from '@vegaprotocol/datagrid';
import {
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import {
  useRewardsHistoryQuery,
  type RewardsHistoryQuery,
} from './__generated__/Rewards';
import { useRewardsRowData } from './use-reward-row-data';

export const RewardsHistoryContainer = ({
  epoch,
  pubKey,
}: {
  pubKey: string | null;
  epoch: number;
}) => {
  const [epochVariables, setEpochVariables] = useState(() => ({
    from: epoch - 1,
    to: epoch,
  }));

  const { data: assets } = useAssetsMapProvider();

  // No need to specify the fromEpoch as it will by default give you the last
  const { refetch, data, loading } = useRewardsHistoryQuery({
    variables: {
      partyId: pubKey || '',
      fromEpoch: epochVariables.from,
      toEpoch: epochVariables.to,
    },
  });

  const debouncedRefetch = useMemo(
    () => debounce((variables) => refetch(variables), 800),
    [refetch]
  );

  const handleEpochChange = (incoming: { from: number; to: number }) => {
    if (!Number.isInteger(incoming.from) || !Number.isInteger(incoming.to)) {
      return;
    }

    if (incoming.from > incoming.to) {
      return;
    }

    // Must be at least the first epoch
    if (incoming.from < 0 || incoming.to < 0) {
      return;
    }

    if (incoming.from > epoch || incoming.to > epoch) {
      return;
    }

    setEpochVariables({
      from: incoming.from,
      to: Math.min(incoming.to, epoch),
    });
    debouncedRefetch({
      partyId: pubKey || '',
      fromEpoch: incoming.from,
      toEpoch: incoming.to,
    });
  };

  return (
    <RewardHistoryTable
      pubKey={pubKey}
      epochRewardSummaries={data?.epochRewardSummaries}
      partyRewards={data?.party?.rewardsConnection}
      onEpochChange={handleEpochChange}
      epoch={epoch}
      epochVariables={epochVariables}
      assets={assets}
      loading={loading}
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

export type PartyRewardsConnection = NonNullable<
  RewardsHistoryQuery['party']
>['rewardsConnection'];

export const RewardHistoryTable = ({
  epochRewardSummaries,
  partyRewards,
  assets,
  pubKey,
  epochVariables,
  epoch,
  onEpochChange,
  loading,
}: {
  epochRewardSummaries: RewardsHistoryQuery['epochRewardSummaries'];
  partyRewards: PartyRewardsConnection;
  assets: Record<string, AssetFieldsFragment> | null;
  pubKey: string | null;
  epoch: number;
  epochVariables: {
    from: number;
    to: number;
  };
  onEpochChange: (epochVariables: { from: number; to: number }) => void;
  loading: boolean;
}) => {
  const [isParty, setIsParty] = useState(false);

  const rowData = useRewardsRowData({
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
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-muted flex items-center gap-2 text-sm">
          <label htmlFor="fromEpoch">{t('From epoch')}</label>
          <EpochInput
            id="fromEpoch"
            value={epochVariables.from}
            max={epochVariables.to}
            onChange={(value) =>
              onEpochChange({
                from: value,
                to: epochVariables.to,
              })
            }
            onIncrement={() =>
              onEpochChange({
                from: epochVariables.from + 1,
                to: epochVariables.to,
              })
            }
            onDecrement={() =>
              onEpochChange({
                from: epochVariables.from - 1,
                to: epochVariables.to,
              })
            }
          />

          <label htmlFor="toEpoch">{t('to')}</label>

          <EpochInput
            id="toEpoch"
            value={epochVariables.to}
            max={epoch}
            onChange={(value) =>
              onEpochChange({
                from: epochVariables.from,
                to: value,
              })
            }
            onIncrement={() =>
              onEpochChange({
                from: epochVariables.from,
                to: epochVariables.to + 1,
              })
            }
            onDecrement={() =>
              onEpochChange({
                from: epochVariables.from,
                to: epochVariables.to - 1,
              })
            }
          />
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
        // Show loading message without wiping out the current rows
        overlayNoRowsTemplate={loading ? t('Loading...') : t('No rows')}
      />
    </div>
  );
};

const EpochInput = ({
  id,
  value,
  max,
  min = 1,
  step = 1,
  onChange,
  onIncrement,
  onDecrement,
}: {
  id: string;
  value: number;
  max?: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  return (
    <span className="flex gap-0.5" data-testid={id}>
      <span className="bg-vega-clight-600 dark:bg-vega-cdark-600 relative rounded-l-sm">
        <span className="px-2 opacity-0">{value}</span>
        <input
          onChange={(e) => onChange(Number(e.target.value))}
          value={value}
          className="dark:focus:bg-vega-cdark-700 absolute left-0 top-0 h-full w-full appearance-none bg-transparent px-2 focus:outline-none"
          type="number"
          step={step}
          min={min}
          max={max}
          id={id}
          name={id}
        />
      </span>
      <span className="flex flex-col gap-0.5 overflow-hidden rounded-r-sm">
        <button
          onClick={onIncrement}
          className="bg-vega-clight-600 dark:bg-vega-cdark-600 flex flex-1 items-center px-1"
        >
          <VegaIcon name={VegaIconNames.CHEVRON_UP} size={12} />
        </button>
        <button
          onClick={onDecrement}
          className="bg-vega-clight-600 dark:bg-vega-cdark-600 flex flex-1 items-center px-1"
        >
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={12} />
        </button>
      </span>
    </span>
  );
};
