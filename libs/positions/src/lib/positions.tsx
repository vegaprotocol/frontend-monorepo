import { useRef, useCallback, useMemo } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import filter from 'lodash/filter';
import PositionsTable, { PositionsSummaryTable } from './positions-table';
import type { GetRowsParams } from './positions-table';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';
import { AssetBalance } from '@vegaprotocol/accounts';
import type { Position } from './positions-data-providers';

interface PositionsProps {
  partyId: string;
  assetSymbol: string;
}

const getSummaryRow = (positions: Position[]) => {
  const summaryRow = {
    openVolume: BigInt(0),
    realisedPNL: BigInt(0),
    unrealisedPNL: BigInt(0),
  };
  positions.forEach((position) => {
    summaryRow.openVolume += BigInt(position.openVolume);
    summaryRow.realisedPNL += BigInt(position.realisedPNL);
    summaryRow.unrealisedPNL += BigInt(position.unrealisedPNL);
  });
  return {
    marketName: t('Total'),
    openVolume: summaryRow.openVolume.toString(),
    realisedPNL: summaryRow.realisedPNL.toString(),
    unrealisedPNL: summaryRow.unrealisedPNL.toString(),
    assetDecimals: positions[0].assetDecimals,
  };
};

export const Positions = ({ partyId, assetSymbol }: PositionsProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const summaryGridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({ data }: { data: Position[] | null }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      dataRef.current = filter(data, { assetSymbol });
      gridRef.current.api.refreshInfiniteCache();
      return true;
    },
    [assetSymbol]
  );
  const { data, error, loading } = useDataProvider<Position[], never>({
    dataProvider,
    update,
    variables,
  });
  dataRef.current = filter(data, { assetSymbol });
  const getRows = async ({
    successCallback,
    startRow,
    endRow,
  }: GetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current.slice(startRow, endRow)
      : [];
    const lastRow = dataRef.current?.length ?? -1;
    successCallback(rowsThisBlock, lastRow);
    if (summaryGridRef && dataRef.current?.length) {
      summaryGridRef.current?.api.setRowData([getSummaryRow(dataRef.current)]);
    }
  };
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <h3>
        {assetSymbol} {t('markets')}
      </h3>
      <p>
        {assetSymbol} {t('balance')}:
        <AssetBalance partyId={partyId} assetSymbol={assetSymbol} />
      </p>
      <PositionsTable
        domLayout="autoHeight"
        ref={gridRef}
        alignedGrids={
          summaryGridRef.current ? [summaryGridRef.current] : undefined
        }
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
      />
      {data?.length ? (
        <PositionsSummaryTable
          ref={summaryGridRef}
          alignedGrids={gridRef.current ? [gridRef.current] : undefined}
          rowData={[getSummaryRow(dataRef.current)]}
          headerHeight={0}
        />
      ) : null}
    </AsyncRenderer>
  );
};
