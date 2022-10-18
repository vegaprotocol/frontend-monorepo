import { useCallback, useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Position } from '../';
import { useClosePosition, usePositionsData, PositionsTable } from '../';
import { Requested } from './close-position-dialog/requested';
import { Complete } from './close-position-dialog/complete';
import type { AgGridReact } from 'ag-grid-react';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData(partyId, gridRef);
  const { submit, closingOrder, transaction, Dialog } = useClosePosition();

  const onClose = useCallback(
    (position: Position) => {
      submit(position);
    },
    [submit]
  );

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
      <Dialog
        content={{
          Requested: <Requested partyId={partyId} order={closingOrder} />,
          Complete: (
            <Complete
              partyId={partyId}
              order={closingOrder}
              transaction={transaction}
            />
          ),
        }}
      />
    </>
  );
};
