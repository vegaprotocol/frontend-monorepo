import { getRowId, usePositionsData } from '@vegaprotocol/positions';
import { PriceFlashCell } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

import { NO_DATA_MESSAGE } from '../../../constants';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import useColumnDefinitions from './use-column-definitions';

import type { AgGridReact } from 'ag-grid-react';
import type { Position } from '@vegaprotocol/positions';
const Positions = () => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { partyId } = useOutletContext<{ partyId: string }>();
  const { data, error, loading } = usePositionsData(partyId, gridRef);
  const { columnDefs, defaultColDef } = useColumnDefinitions();
  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data?.length ? data : null}
      noDataMessage={NO_DATA_MESSAGE}
    >
      <ConsoleLiteGrid<Position>
        ref={gridRef}
        domLayout="autoHeight"
        classNamesParam="h-auto"
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        rowData={data || undefined}
        components={{ PriceFlashCell }}
      />
    </AsyncRenderer>
  );
};

export default Positions;
