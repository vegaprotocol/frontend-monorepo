import { useRef, useCallback, useMemo, memo } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import { t, toBigNum, useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import filter from 'lodash/filter';
import PositionsTable from './positions-table';
import type { Position } from './positions-data-providers';
import type { GetRowsParams } from './positions-table';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';
import { AssetBalance } from '@vegaprotocol/accounts';
import { usePositionsData } from './use-positions-data';

interface PositionsProps {
  partyId: string;
  assetSymbol: string;
  onClose: (position: Position) => void;
}

export const Positions = memo(
  ({ partyId, assetSymbol, onClose }: PositionsProps) => {
    const gridRef = useRef<AgGridReact | null>(null);
    const { data, error, loading, getRows } = usePositionsData({
      partyId,
      assetSymbol,
      gridRef,
    });

    return (
      <AsyncRenderer loading={loading} error={error} data={data}>
        <div className="p-2">
          <h4 className="text-lg">
            {assetSymbol} {t('markets')}
          </h4>
          <p>
            {assetSymbol} {t('balance')}:
            <span data-testid="balance" className="pl-1 font-mono">
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
