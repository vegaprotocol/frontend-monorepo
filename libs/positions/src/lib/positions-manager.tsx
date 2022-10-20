import { useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useClosePosition, usePositionsData, PositionsTable } from '../';
import type { AgGridReact } from 'ag-grid-react';
import { Requested } from './close-position-dialog/requested';
import { Complete } from './close-position-dialog/complete';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData(partyId, gridRef);
  const { submit, closingOrder, transaction, Dialog } = useClosePosition();

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
          onClose={(position) => submit(position)}
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
