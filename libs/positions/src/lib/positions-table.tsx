import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  volumePrefix,
  addDecimal,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { Positions_party_positions } from './__generated__/Positions';
import { MarketTradingMode } from '@vegaprotocol/types';

interface PositionsTableProps {
  data: Positions_party_positions[] | null;
}

export const getRowId = ({ data }: { data: Positions_party_positions }) =>
  data.market.id;

const alphanumericComparator = (a: string, b: string, isInverted: boolean) => {
  if (a < b) {
    return isInverted ? 1 : -1;
  }

  if (a > b) {
    return isInverted ? -1 : 1;
  }

  return 0;
};

const comparator = (
  valueA: string,
  valueB: string,
  nodeA: { data: Positions_party_positions },
  nodeB: { data: Positions_party_positions },
  isInverted: boolean
) =>
  alphanumericComparator(
    nodeA.data.market.tradableInstrument.instrument.name,
    nodeB.data.market.tradableInstrument.instrument.name,
    isInverted
  ) ||
  alphanumericComparator(
    nodeA.data.market.id,
    nodeB.data.market.id,
    isInverted
  );

interface PositionsTableValueFormatterParams extends ValueFormatterParams {
  data: Positions_party_positions;
}

export const PositionsTable = forwardRef<AgGridReact, PositionsTableProps>(
  ({ data }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate="No positions"
        rowData={data}
        getRowId={getRowId}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
        onGridReady={(event) => {
          event.columnApi.applyColumnState({
            state: [
              {
                colId: 'market.tradableInstrument.instrument.code',
                sort: 'asc',
              },
            ],
          });
        }}
        components={{ PriceFlashCell }}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.code"
          comparator={comparator}
          sortable
        />
        <AgGridColumn
          headerName={t('Size')}
          field="openVolume"
          valueFormatter={({
            value,
            data,
          }: PositionsTableValueFormatterParams) =>
            volumePrefix(addDecimal(value, data.market.positionDecimalPlaces))
          }
        />
        <AgGridColumn
          headerName={t('Average Entry Price')}
          field="averageEntryPrice"
          cellRenderer="PriceFlashCell"
          valueFormatter={({
            value,
            data,
          }: PositionsTableValueFormatterParams) =>
            addDecimalsFormatNumber(value, data.market.decimalPlaces)
          }
        />
        <AgGridColumn
          headerName={t('Mark Price')}
          field="market.data.markPrice"
          type="rightAligned"
          cellRenderer="PriceFlashCell"
          valueFormatter={({
            value,
            data,
          }: PositionsTableValueFormatterParams) => {
            if (
              data.market.data?.marketTradingMode ===
              MarketTradingMode.OpeningAuction
            ) {
              return '-';
            }
            return addDecimal(value, data.market.decimalPlaces);
          }}
        />
        <AgGridColumn
          headerName={t('Realised PNL')}
          field="realisedPNL"
          type="rightAligned"
          cellClassRules={{
            'color-vega-green': ({ value }: { value: string }) =>
              Number(value) > 0,
            'color-vega-red': ({ value }: { value: string }) =>
              Number(value) < 0,
          }}
          valueFormatter={({ value, data }: ValueFormatterParams) =>
            volumePrefix(
              addDecimalsFormatNumber(value, data.market.decimalPlaces, 3)
            )
          }
          cellRenderer="PriceFlashCell"
        />
      </AgGrid>
    );
  }
);

export default PositionsTable;
