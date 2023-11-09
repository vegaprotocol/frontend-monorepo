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

  const handleEpochChange = (incoming: { from: number; to: number }) => {
    if (!Number.isInteger(incoming.from) || !Number.isInteger(incoming.to)) {
      return;
    }

    if (incoming.from > incoming.to) {
      return;
    }

    if (incoming.from < -1 || incoming.to < -1) {
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
      epochRewardSummaries={rewardsData?.epochRewardSummaries}
      partyRewards={rewardsData?.party?.rewardsConnection}
      onEpochChange={handleEpochChange}
      epoch={epoch}
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

export type PartyRewardsConnection = NonNullable<
  RewardsHistoryQuery['party']
>['rewardsConnection'];

const RewardHistoryTable = ({
  epochRewardSummaries,
  partyRewards,
  assets,
  pubKey,
  epochVariables,
  epoch,
  onEpochChange,
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
  onEpochChange: (x: { from: number; to: number }) => void;
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
      <div className="flex justify-between gap-2 items-center mb-2">
        <h4 className="text-muted text-sm flex items-center gap-2">
          {t('From epoch')}
          <EpochInput
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

          {t('to')}

          <EpochInput
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
      />
    </div>
  );
};

const EpochInput = ({
  value,
  max,
  min = 1,
  step = 1,
  onChange,
  onIncrement,
  onDecrement,
}: {
  value: number;
  max?: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  return (
    <span className="flex gap-0.5">
      <span className="relative bg-vega-clight-600 dark:bg-vega-cdark-600 rounded-l-sm">
        <span className="px-2 opacity-0">{value}</span>
        <input
          onChange={(e) => onChange(Number(e.target.value))}
          value={value}
          className="px-2 absolute top-0 left-0 w-full h-full appearance-none bg-transparent focus:outline-none dark:focus:bg-vega-cdark-700"
          type="number"
          step={step}
          min={min}
          max={max}
        />
      </span>
      <span className="flex flex-col gap-0.5 rounded-r-sm overflow-hidden">
        <button
          onClick={onIncrement}
          className="px-1 flex-1 flex items-center bg-vega-clight-600 dark:bg-vega-cdark-600"
        >
          <VegaIcon name={VegaIconNames.CHEVRON_UP} size={12} />
        </button>
        <button
          onClick={onDecrement}
          className="px-1 flex-1 flex items-center bg-vega-clight-600 dark:bg-vega-cdark-600"
        >
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={12} />
        </button>
      </span>
    </span>
  );
};
