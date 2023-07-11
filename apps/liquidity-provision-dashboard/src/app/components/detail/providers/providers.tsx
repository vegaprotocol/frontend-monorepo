import { useCallback, useMemo } from 'react';

import type { GetRowIdParams, ColDef } from 'ag-grid-community';
import { t } from '@vegaprotocol/i18n';

import type {
  LiquidityProviderFeeShareFieldsFragment,
  LiquidityProvisionFieldsFragment,
} from '@vegaprotocol/liquidity';
import { formatWithAsset } from '@vegaprotocol/liquidity';

import { Grid } from '../../grid';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';

const formatToHours = ({ value }: { value?: string | null }) => {
  if (!value) {
    return '-';
  }

  const MS_IN_HOUR = 1000 * 60 * 60;
  const created = new Date(value).getTime();
  const now = new Date().getTime();
  return `${Math.round(Math.abs(now - created) / MS_IN_HOUR)}h`;
};

export const LPProvidersGrid = ({
  liquidityProviders,
  settlementAsset,
}: {
  liquidityProviders: LiquidityProvisionFieldsFragment &
    LiquidityProviderFeeShareFieldsFragment[];
  settlementAsset: {
    decimals?: number;
    symbol?: string;
  };
}) => {
  const getRowId = useCallback(({ data }: GetRowIdParams) => data.party.id, []);
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('LPs'),
        field: 'party.id',
        flex: 1,
        minWidth: 100,
        headerTooltip: t('Liquidity providers'),
      },
      {
        headerName: t('Duration'),
        valueFormatter: formatToHours,
        field: 'createdAt',
        headerTooltip: t('Time in market'),
      },
      {
        headerName: t('Equity-like share'),
        field: 'equityLikeShare',
        valueFormatter: ({ value }: { value?: string | null }) => {
          return value
            ? `${parseFloat(parseFloat(value).toFixed(2)) * 100}%`
            : '';
        },
        headerTooltip: t(
          'The share of the markets liquidity held - the earlier you commit liquidity the greater % fees you earn'
        ),
        minWidth: 140,
      },
      {
        headerName: t('committed bond'),
        field: 'commitmentAmount',
        valueFormatter: ({ value }: { value?: string | null }) =>
          value ? formatWithAsset(value, settlementAsset) : '0',
        headerTooltip: t('The amount of funds allocated to provide liquidity'),
        minWidth: 140,
      },
      {
        headerName: t('Margin Req.'),
        field: 'margin',
        headerTooltip: t(
          'Margin required for arising positions based on liquidity commitment'
        ),
      },
      {
        headerName: t('24h Fees'),
        field: 'fees',
        headerTooltip: t(
          'Total fees earned by the liquidity provider in the last 24 hours'
        ),
      },
      {
        headerName: t('Fee level'),
        valueFormatter: ({ value }: { value?: string | null }) => `${value}%`,
        field: 'fee',
        headerTooltip: t(
          "The market's liquidity fee, or the percentage of a trade's value which is collected from the price taker for every trade"
        ),
      },

      {
        headerName: t('APY'),
        field: 'apy',
        headerTooltip: t(
          'An annualised estimate based on the total liquidity provision fees and maker fees collected by liquidity providers, the maximum margin needed and maximum commitment (bond) over the course of 7 epochs'
        ),
      },
    ],
    [settlementAsset]
  );

  return (
    <Grid
      rowData={liquidityProviders}
      tooltipShowDelay={500}
      defaultColDef={{
        resizable: true,
        sortable: true,
        unSortIcon: true,
        cellClass: ['flex', 'flex-col', 'justify-center'],
        tooltipComponent: TooltipCellComponent,
        minWidth: 100,
      }}
      columnDefs={columnDefs}
      getRowId={getRowId}
      rowHeight={92}
    />
  );
};
