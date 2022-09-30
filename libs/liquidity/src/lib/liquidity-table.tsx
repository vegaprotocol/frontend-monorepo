import { forwardRef } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import {
  AgGridDynamic as AgGrid,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type { LiquidityProvision } from './liquidity-data-provider';
import type { ValueFormatterParams } from 'ag-grid-community';
import BigNumber from 'bignumber.js';
import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';

const percentageFormatter = ({ value }: ValueFormatterParams) => {
  if (!value) return '-';
  return formatNumberPercentage(new BigNumber(value).times(100), 4) || '-';
};

const dateValueFormatter = ({ value }: { value?: string | null }) => {
  if (!value) {
    return '-';
  }
  return getDateTimeFormat().format(new Date(value));
};

export interface LiquidityTableProps {
  data: LiquidityProvision[];
  symbol?: string;
  assetDecimalPlaces?: number;
}

export const LiquidityTable = forwardRef<AgGridReact, LiquidityTableProps>(
  ({ data, symbol = '', assetDecimalPlaces }, ref) => {
    const assetDecimalsFormatter = ({ value }: ValueFormatterParams) => {
      if (!value) return '-';
      return `${addDecimalsFormatNumber(value, assetDecimalPlaces ?? 0)}`;
    };
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No liquidity provisions')}
        getRowId={({ data }) => data.party}
        rowHeight={34}
        ref={ref}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          minWidth: 100,
          tooltipComponent: TooltipCellComponent,
        }}
        rowData={data}
      >
        <AgGridColumn
          headerName={t('Party')}
          field="party"
          headerTooltip={t(
            'The public key of the party making this commitment.'
          )}
        />
        <AgGridColumn
          headerName={t(`Commitment (${symbol})`)}
          field="commitmentAmount"
          type="rightAligned"
          headerTooltip={t(
            'The amount committed to the market by this liquidity provider.'
          )}
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Share')}
          field="equityLikeShare"
          type="rightAligned"
          headerTooltip={t(
            'The equity-like share of liquidity of the market, specific to each liquidity provider.'
          )}
          valueFormatter={percentageFormatter}
        />
        <AgGridColumn
          headerName={t('Proposed fee')}
          headerTooltip={t(
            'The fee percentage (per trade) proposed by each liquidity provider.'
          )}
          field="fee"
          type="rightAligned"
          valueFormatter={percentageFormatter}
        />
        <AgGridColumn
          headerName={t('Average entry valuation')}
          field="averageEntryValuation"
          type="rightAligned"
          headerTooltip={t(
            'The average entry valuation of this liquidity provision for the market.'
          )}
          minWidth={160}
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Obligation')}
          field="obligation"
          type="rightAligned"
          headerTooltip={t(
            'The liquidity provider’s obligation to the market, calculated as the liquidity commitment amount multiplied by the value of the stake_to_ccy_siskas network parameter.'
          )}
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Supplied')}
          headerTooltip={t(
            'The amount of the settlement asset supplied for liquidity by this provider, calculated as the bond account balance multiplied by the value of the stake_to_ccy_siskas network parameter.'
          )}
          field="supplied"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Status')}
          headerTooltip={t('The current status of this liquidity provision.')}
          field="status"
          valueFormatter={({ value }: { value: LiquidityProvisionStatus }) => {
            if (!value) return value;
            return LiquidityProvisionStatusMapping[value];
          }}
        />
        <AgGridColumn
          headerName={t('Created')}
          headerTooltip={t(
            'The date and time this liquidity provision was created.'
          )}
          field="createdAt"
          type="rightAligned"
          valueFormatter={dateValueFormatter}
        />
        <AgGridColumn
          headerName={t('Updated')}
          headerTooltip={t(
            'The last time this liquidity provision was updated.'
          )}
          field="updatedAt"
          type="rightAligned"
          valueFormatter={dateValueFormatter}
        />
      </AgGrid>
    );
  }
);

export default LiquidityTable;
