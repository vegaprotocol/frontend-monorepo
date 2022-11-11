import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { BigNumber } from 'bignumber.js';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import { positionsMetricsProvider } from './positions-data-providers';
import type { PositionsMetricsProviderVariables } from './positions-data-providers';
import { t, toBigNum, useDataProvider } from '@vegaprotocol/react-helpers';

export const getRowId = ({ data }: { data: Position }) => data.marketId;

export const getSummaryRowData = (positions: Position[]) => {
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
  gridRef: RefObject<AgGridReact>
) => {
  const variables = useMemo<PositionsMetricsProviderVariables>(
    () => ({ partyId }),
    [partyId]
  );
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: Position[] | null;
      delta?: Position[] | null;
    }) => {
      dataRef.current = data;

      const update: Position[] = [];
      const add: Position[] = [];
      if (!gridRef.current?.api) {
        return false;
      }
      (delta || []).forEach((position) => {
        const rowNode = gridRef.current?.api.getRowNode(
          getRowId({ data: position })
        );
        if (rowNode) {
          update.push(position);
        } else {
          add.push(position);
        }
      });
      if (update.length || add.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
        const summaryRowNode = gridRef.current.api.getPinnedBottomRow(0);
        if (summaryRowNode && dataRef.current) {
          summaryRowNode.data = getSummaryRowData(dataRef.current);
          gridRef.current.api.refreshCells({
            force: true,
            rowNodes: [summaryRowNode],
          });
        } else {
          gridRef.current.api.setPinnedBottomRowData(
            dataRef.current ? [getSummaryRowData(dataRef.current)] : []
          );
        }
      }
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider({
    dataProvider: positionsMetricsProvider,
    update,
    variables,
  });
  return {
    data,
    error,
    loading,
  };
};
