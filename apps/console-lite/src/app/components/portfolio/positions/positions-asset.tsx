import { AssetBalance } from '@vegaprotocol/accounts';
import { usePositionsData } from '@vegaprotocol/positions';
import { PriceFlashCell, t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';

import { ConsoleLiteGrid } from '../../console-lite-grid';
import useColumnDefinitions from './use-column-definitions';

import type { AgGridReact } from 'ag-grid-react';
import type { Position } from '@vegaprotocol/positions';
interface Props {
  partyId: string;
  assetSymbol: string;
}

const getRowId = ({ data }: { data: Position }) => data.marketId;

const PositionsAsset = ({ partyId, assetSymbol }: Props) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData(
    partyId,
    gridRef,
    assetSymbol
  );
  const { columnDefs, defaultColDef } = useColumnDefinitions();
  return (
    <AsyncRenderer loading={loading} error={error} data={data || []}>
      <div
        data-testid={`positions-asset-${assetSymbol}`}
        className="flex justify-between items-center px-4 pt-3 pb-1"
      >
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
      <ConsoleLiteGrid<Position & { id: undefined }>
        ref={gridRef}
        domLayout="autoHeight"
        classNamesParam="h-auto"
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        components={{ PriceFlashCell }}
      />
    </AsyncRenderer>
  );
};

export default PositionsAsset;
