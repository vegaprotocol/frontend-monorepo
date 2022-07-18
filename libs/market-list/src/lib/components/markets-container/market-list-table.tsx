import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  t,
  formatLabel,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';

type Props = AgGridReactProps | AgReactUiProps;

export const MarketListTable = forwardRef<AgGridReact, Props>((props, ref) => {
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate={t('No markets')}
      getRowId={({ data }) => data?.id}
      ref={ref}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      suppressCellFocus={true}
      components={{ PriceFlashCell }}
      {...props}
    >
      <AgGridColumn
        headerName={t('Market')}
        field="tradableInstrument.instrument.code"
      />
      <AgGridColumn
        headerName={t('Settlement asset')}
        field="tradableInstrument.instrument.product.settlementAsset.symbol"
      />
      <AgGridColumn
        headerName={t('Trading mode')}
        field="data"
        minWidth={200}
        valueFormatter={({ value }: ValueFormatterParams) => {
          if (!value) return value;
          const { market, trigger } = value;
          return market &&
            market.tradingMode === MarketTradingMode.MonitoringAuction &&
            trigger &&
            trigger !== AuctionTrigger.Unspecified
            ? `${formatLabel(market.tradingMode)} - ${trigger.toLowerCase()}`
            : formatLabel(market?.tradingMode);
        }}
      />
      <AgGridColumn
        headerName={t('Best bid')}
        field="data.bestBidPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        valueFormatter={({ value, data }: ValueFormatterParams) =>
          value === undefined
            ? value
            : addDecimalsFormatNumber(value, data.decimalPlaces)
        }
      />
      <AgGridColumn
        headerName={t('Best offer')}
        field="data.bestOfferPrice"
        type="rightAligned"
        valueFormatter={({ value, data }: ValueFormatterParams) =>
          value === undefined
            ? value
            : addDecimalsFormatNumber(value, data.decimalPlaces)
        }
        cellRenderer="PriceFlashCell"
      />
      <AgGridColumn
        headerName={t('Mark price')}
        field="data.markPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        valueFormatter={({ value, data }: ValueFormatterParams) =>
          value === undefined
            ? value
            : addDecimalsFormatNumber(value, data.decimalPlaces)
        }
      />
      <AgGridColumn headerName={t('Description')} field="name" />
    </AgGrid>
  );
});

export default MarketListTable;
