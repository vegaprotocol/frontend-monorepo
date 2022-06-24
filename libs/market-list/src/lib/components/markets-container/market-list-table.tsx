import React, { forwardRef, ReactNode } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type {
  Markets_markets,
  Markets_markets_data_market,
} from '../__generated__/Markets';

// type MarketsDataType = Markets_markets | Markets_markets_data_market
type MarketsDataType = { id: string };

interface MarketListTableProps<T = MarketsDataType> {
  data: ReadonlyArray<T> | null;
  onRowClicked: (marketId: string) => void;
  children?: React.ReactElement;
}

export const getRowId = <T extends MarketsDataType>({ data }: { data: T }) =>
  data.id;

export const MarketListTable = forwardRef<AgGridReact, MarketListTableProps>(
  ({ data, onRowClicked, children }, ref) => {
    return (
      children || (
        <AgGrid
          style={{ width: '100%', height: '100%' }}
          overlayNoRowsTemplate={t('No markets')}
          rowData={data as any}
          getRowId={getRowId}
          ref={ref}
          defaultColDef={{
            flex: 1,
            resizable: true,
          }}
          suppressCellFocus={true}
          onRowClicked={({ data }) => onRowClicked(data.id)}
          components={{ PriceFlashCell }}
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
            headerName={t('State')}
            field="data"
            valueFormatter={({ value }: ValueFormatterParams) =>
              `${value.market.state} (${value.market.tradingMode})`
            }
          />
          <AgGridColumn
            headerName={t('Best bid')}
            field="data.bestBidPrice"
            type="rightAligned"
            cellRenderer="PriceFlashCell"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              addDecimalsFormatNumber(value, data.decimalPlaces)
            }
          />
          <AgGridColumn
            headerName={t('Best offer')}
            field="data.bestOfferPrice"
            type="rightAligned"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              addDecimalsFormatNumber(value, data.decimalPlaces)
            }
            cellRenderer="PriceFlashCell"
          />
          <AgGridColumn
            headerName={t('Mark price')}
            field="data.markPrice"
            type="rightAligned"
            cellRenderer="PriceFlashCell"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              addDecimalsFormatNumber(value, data.decimalPlaces)
            }
          />
          <AgGridColumn headerName={t('Description')} field="name" />
        </AgGrid>
      )
    );
  }
);

type MarketListTableTypedProps<T> = {
  passedRef: React.ForwardedRef<AgGridReact>;
} & MarketListTableProps<T>;

export const MarketListTableTyped = <T extends MarketsDataType>({
  passedRef,
  ...props
}: MarketListTableTypedProps<T>) => {
  return <MarketListTable ref={passedRef} {...props} />;
};

export default MarketListTable;
