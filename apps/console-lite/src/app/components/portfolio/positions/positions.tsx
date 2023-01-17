import { useOutletContext } from 'react-router-dom';
import { PriceFlashCell } from '@vegaprotocol/react-helpers';
import { usePositionsData, getRowId } from '@vegaprotocol/positions';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from '@vegaprotocol/positions';
import { NO_DATA_MESSAGE } from '../../../constants';

import useColumnDefinitions from './use-column-definitions';

const Positions = () => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { partyId } = useOutletContext<{ partyId: string }>();
  const { data, error, loading, getRows } = usePositionsData(partyId, gridRef);
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
        rowModelType="infinite"
        datasource={{ getRows }}
        components={{ PriceFlashCell }}
      />
    </AsyncRenderer>
  );
};

export default Positions;
