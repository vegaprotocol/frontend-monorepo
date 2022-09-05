import { useRef, useCallback, useMemo, memo } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import { t, toBigNum, useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import filter from 'lodash/filter';
import PositionsTable from './positions-table';
import type { GetRowsParams } from './positions-table';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';
import { AssetBalance } from '@vegaprotocol/accounts';
import type { Position } from './positions-data-providers';
interface PositionsProps {
  partyId: string;
  assetSymbol: string;
  onClose: (position: Position) => void;
}

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

export const Positions = memo(
  ({ partyId, assetSymbol, onClose }: PositionsProps) => {
    const gridRef = useRef<AgGridReact | null>(null);
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
      if (gridRef.current?.api) {
        gridRef.current.api.setPinnedBottomRowData([
          getSummaryRow(rowsThisBlock),
        ]);
      }
    };
    return (
      <AsyncRenderer loading={loading} error={error} data={data}>
        <div className="p-2">
          <h4 className="text-lg">
            {assetSymbol} {t('markets')}
          </h4>
          <p>
            {assetSymbol} {t('balance')}:
            <span className="pl-1 font-mono">
              <AssetBalance partyId={partyId} assetSymbol={assetSymbol} />
            </span>
          </p>
        </div>
        <PositionsTable
          domLayout="autoHeight"
          style={{ width: '100%' }}
          ref={gridRef}
          rowModelType={data?.length ? 'infinite' : 'clientSide'}
          rowData={data?.length ? undefined : []}
          datasource={{ getRows }}
          onClose={onClose}
        />
      </AsyncRenderer>
    );
  }
);
