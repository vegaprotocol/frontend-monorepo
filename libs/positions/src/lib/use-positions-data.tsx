import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { BigNumber } from 'bignumber.js';
import type { AgGridReact } from 'ag-grid-react';
import type { GetRowsParams } from './positions-table';
import type { Position } from './positions-data-providers';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';
import filter from 'lodash/filter';
import { t, toBigNum, useDataProvider } from '@vegaprotocol/react-helpers';

const getSummaryRow = (positions: Position[]) => {
  const summaryRow = {
    notional: new BigNumber(0),
    realisedPNL: BigInt(0),
    unrealisedPNL: BigInt(0),
  };
  positions.forEach((position) => {
    summaryRow.notional = summaryRow.notional.plus(
      toBigNum(position.notional, position.marketDecimalPlaces)
    );
    summaryRow.realisedPNL += BigInt(position.realisedPNL);
    summaryRow.unrealisedPNL += BigInt(position.unrealisedPNL);
  });
  const decimals = positions[0]?.decimals || 0;
  return {
    marketName: t('Total'),
    // we are using asset decimals instead of market decimals because each market can have different decimals
    notional: summaryRow.notional
      .multipliedBy(10 ** decimals)
      .toFixed()
      .toString(),
    realisedPNL: summaryRow.realisedPNL.toString(),
    unrealisedPNL: summaryRow.unrealisedPNL.toString(),
    decimals,
  };
};

export const usePositionsData = (
  partyId: string,
  gridRef: RefObject<AgGridReact>,
  assetSymbol?: string,
  withSummaryRow?: boolean
) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({ data }: { data: Position[] | null }) => {
      dataRef.current = assetSymbol ? filter(data, { assetSymbol }) : data;
      gridRef.current?.api.refreshInfiniteCache();
      return true;
    },
    [assetSymbol, gridRef]
  );
  const { data, error, loading } = useDataProvider<Position[], never>({
    dataProvider,
    update,
    variables,
  });
  if (!dataRef.current && data) {
    dataRef.current = assetSymbol ? filter(data, { assetSymbol }) : data;
  }
  const getRows = useCallback(
    async ({ successCallback, startRow, endRow }: GetRowsParams) => {
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow)
        : [];
      const lastRow = dataRef.current?.length ?? -1;
      successCallback(rowsThisBlock, lastRow);
      if (withSummaryRow && gridRef.current?.api) {
        gridRef.current.api.setPinnedBottomRowData([
          getSummaryRow(rowsThisBlock),
        ]);
      }
    },
    [gridRef, withSummaryRow]
  );
  return {
    data,
    error,
    loading,
    getRows,
  };
};
