import { forwardRef, useMemo } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceCell,
  formatNumber,
  volumePrefix,
  addDecimal,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import compact from 'lodash/compact';
import type { Positions_party_positions } from './__generated__/Positions';
import { MarketTradingMode } from '@vegaprotocol/types';

interface PositionsTableProps {
  data: Positions_party_positions[] | null;
}

export const getRowNodeId = (data: { market: { id: string } }) =>
  data.market.id;

const sortByName = (
  a: Positions_party_positions,
  b: Positions_party_positions
) => {
  if (
    a.market.tradableInstrument.instrument.name <
    b.market.tradableInstrument.instrument.name
  ) {
    return -1;
  }

  if (
    a.market.tradableInstrument.instrument.name >
    b.market.tradableInstrument.instrument.name
  ) {
    return 1;
  }

  return 0;
};

interface PositionsTableValueFormatterParams extends ValueFormatterParams {
  data: Positions_party_positions;
}

export const PositionsTable = forwardRef<AgGridReact, PositionsTableProps>(
  ({ data }, ref) => {
    const sortedData = useMemo(() => {
      return compact(data).sort(sortByName);
    }, [data]);
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate="No positions"
        rowData={sortedData}
        getRowNodeId={getRowNodeId}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
        components={{ PriceCell }}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.code"
        />
        <AgGridColumn
          headerName={t('Amount')}
          field="openVolume"
          valueFormatter={({ value }: PositionsTableValueFormatterParams) =>
            volumePrefix(value)
          }
        />
        <AgGridColumn
          headerName={t('Average Entry Price')}
          field="averageEntryPrice"
          cellRenderer="PriceCell"
          valueFormatter={({
            value,
            data,
          }: PositionsTableValueFormatterParams) =>
            formatNumber(value, data.market.decimalPlaces)
          }
        />
        <AgGridColumn
          headerName={t('Mark Price')}
          field="market.data.markPrice"
          type="rightAligned"
          cellRenderer="PriceCell"
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
          valueFormatter={({ value }: ValueFormatterParams) =>
            volumePrefix(value)
          }
          cellRenderer="PriceCell"
        />
      </AgGrid>
    );
  }
);

export default PositionsTable;
