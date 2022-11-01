import { AssetBalance } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { memo, useRef } from 'react';

import PositionsTable from './positions-table';
import { usePositionsData } from './use-positions-data';

import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';

interface PositionsProps {
  partyId: string;
  assetSymbol: string;
  onClose: (position: Position) => void;
}

export const Positions = memo(
  ({ partyId, assetSymbol, onClose }: PositionsProps) => {
    const gridRef = useRef<AgGridReact | null>(null);
    const { data, error, loading, getRows } = usePositionsData(
      partyId,
      gridRef,
      assetSymbol
    );

    return (
      <AsyncRenderer loading={loading} error={error} data={data || []}>
        <div className="flex justify-between items-center px-4 pt-3 pb-1">
          <h4>
            {assetSymbol} {t('markets')}
          </h4>
          <div className="text-sm text-neutral-500 dark:text-neutral-300">
            {assetSymbol} {t('balance')}:
            <span data-testid="balance" className="pl-1 font-mono">
              <AssetBalance partyId={partyId} assetSymbol={assetSymbol} />
            </span>
          </div>
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
