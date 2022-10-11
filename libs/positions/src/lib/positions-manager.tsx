import { useCallback, useRef, useState } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Position } from './positions-data-providers';
import { PositionsTable, useClosePosition, usePositionsData } from '../';
import type { AgGridReact } from 'ag-grid-react';
import { ClosePositionDialog } from './close-position-dialog';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const { submit, transaction, closingOrder } = useClosePosition();
  const [positionToClose, setPositionToClose] = useState<Position>();

  const onClose = useCallback(
    (position: Position) => {
      setPositionToClose(position);
      submit(position);
    },
    [submit]
  );

  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData(partyId, gridRef);
  return (
    <>
      <AsyncRenderer loading={loading} error={error} data={data}>
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
      <ClosePositionDialog
        partyId={partyId}
        transaction={transaction}
        order={closingOrder}
      />
    </>
  );
};
