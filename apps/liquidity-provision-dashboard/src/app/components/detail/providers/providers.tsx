import { useCallback } from 'react';
import { AgGridColumn } from 'ag-grid-react';

import type { GetRowIdParams } from 'ag-grid-community';
import { t } from '@vegaprotocol/react-helpers';

import type { LiquidityProvisionFieldsFragment } from '@vegaprotocol/liquidity';
import { formatWithAsset } from '@vegaprotocol/liquidity';

import { Grid } from '../../grid';

const formatToHours = ({ value }: { value?: string | null }) => {
  if (!value) {
    return '-';
  }

  const MS_IN_HOUR = 1000 * 60 * 60;
  const created = new Date(value).getTime();
  const now = new Date().getTime();
  return `${Math.round(Math.abs(now - created) / MS_IN_HOUR)}h`;
};

export const Providers = ({
  liquidityProviders,
  settlementAsset,
}: {
  liquidityProviders: LiquidityProvisionFieldsFragment[];
  settlementAsset: {
    decimals?: number;
    symbol?: string;
  };
}) => {
  const getRowId = useCallback(({ data }: GetRowIdParams) => data.party.id, []);

  return (
    <Grid
      rowData={liquidityProviders}
      defaultColDef={{
        resizable: true,
        sortable: true,
        unSortIcon: true,
        cellClass: ['flex', 'flex-col', 'justify-center'],
      }}
      getRowId={getRowId}
      rowHeight={92}
    >
      <AgGridColumn
        headerName={t('LPs')}
        field="party.id"
        flex="1"
        minWidth={100}
      />
      <AgGridColumn
        headerName={t('Time in market')}
        valueFormatter={formatToHours}
        field="createdAt"
      />
      <AgGridColumn headerName={t('Galps')} field="Galps" />
      <AgGridColumn
        headerName={t('committed bond/stake')}
        field="commitmentAmount"
        valueFormatter={({ value }: { value?: string | null }) =>
          value ? formatWithAsset(value, settlementAsset) : '0'
        }
      />
      <AgGridColumn headerName={t('Margin Req.')} field="margin" />
      <AgGridColumn headerName={t('24h Fees')} field="fees" />
      <AgGridColumn
        headerName={t('Fee level')}
        valueFormatter={({ value }: { value?: string | null }) => `${value}%`}
        field="fee"
      />

      <AgGridColumn headerName={t('APY')} field="apy" />
    </Grid>
  );
};
