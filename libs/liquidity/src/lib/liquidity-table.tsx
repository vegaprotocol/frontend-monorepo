import { forwardRef } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaValueFormatterParams,
  TypedDataAgGrid,
} from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type { ValueFormatterParams } from 'ag-grid-community';
import BigNumber from 'bignumber.js';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';
import type { LiquidityProvisionData } from './liquidity-data-provider';

const percentageFormatter = ({ value }: ValueFormatterParams) => {
  if (!value) return '-';
  return formatNumberPercentage(new BigNumber(value).times(100), 2) || '-';
};

const dateValueFormatter = ({ value }: { value?: string | null }) => {
  if (!value) {
    return '-';
  }
  return getDateTimeFormat().format(new Date(value));
};

export interface LiquidityTableProps
  extends TypedDataAgGrid<LiquidityProvisionData> {
  symbol?: string;
  assetDecimalPlaces?: number;
  stakeToCcyVolume: string | null;
}

export const LiquidityTable = forwardRef<AgGridReact, LiquidityTableProps>(
  ({ symbol = '', assetDecimalPlaces, stakeToCcyVolume, ...props }, ref) => {
    const assetDecimalsFormatter = ({ value }: ValueFormatterParams) => {
      if (!value) return '-';
      return `${addDecimalsFormatNumber(value, assetDecimalPlaces ?? 0, 5)}`;
    };
    const stakeToCcyVolumeFormatter = ({ value }: ValueFormatterParams) => {
      if (!value) return '-';
      const newValue = new BigNumber(value)
        .times(Number(stakeToCcyVolume) || 1)
        .toString();
      return `${addDecimalsFormatNumber(newValue, assetDecimalPlaces ?? 0, 5)}`;
    };

    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No liquidity provisions')}
        getRowId={({ data }) => `${data.party.id}-${data.status}`}
        ref={ref}
        tooltipShowDelay={500}
        defaultColDef={{
          resizable: true,
          minWidth: 100,
          tooltipComponent: TooltipCellComponent,
          sortable: true,
        }}
        storeKey="liquidityProvisionTable"
        {...props}
      >
        <AgGridColumn
          headerName={t('Party')}
          field="party.id"
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
            'The equity-like share of liquidity of the market used to determine allocation of LP fees. Calculated based on share of total liquidity, with a premium added for length of commitment.'
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
          headerName={t('Market valuation at entry')}
          field="averageEntryValuation"
          type="rightAligned"
          headerTooltip={t(
            'The valuation of the market at the time the liquidity commitment was made. Commitments made at a lower valuation earlier in the lifetime of the market would be expected to have a higher equity-like share if the market has grown. If a commitment is amended, value will reflect the average of the market valuations across the lifetime of the commitment.'
          )}
          minWidth={160}
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Obligation')}
          field="commitmentAmount"
          type="rightAligned"
          headerTooltip={t(
            `The liquidity provider's obligation to the market, calculated as the liquidity commitment amount multiplied by the value of the stake_to_ccy_siskas network parameter to convert into units of liquidity volume. The obligation can be met by a combination of LP orders and limit orders on the order book.`
          )}
          valueFormatter={stakeToCcyVolumeFormatter}
        />
        <AgGridColumn
          headerName={t('Supplied')}
          headerTooltip={t(
            `The amount of liquidity volume supplied by the LP order in order to meet the obligation. If the obligation is already met in full by other limit orders from the same Vega key the LP order is not required and this value will be zero. Also note if the target stake for the market is less than the obligation the full value of the obligation may not be required.`
          )}
          field="balance"
          type="rightAligned"
          valueFormatter={stakeToCcyVolumeFormatter}
        />
        <AgGridColumn
          headerName={t('Status')}
          headerTooltip={t('The current status of this liquidity provision.')}
          field="status"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<LiquidityProvisionData, 'status'>) => {
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
