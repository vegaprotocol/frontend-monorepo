import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';

import { PositionsTable, useClosePosition, usePositionsData } from '../';
import { Complete } from './close-position-dialog/complete';
import { Requested } from './close-position-dialog/requested';

import type { AgGridReact } from 'ag-grid-react';
import type { TransactionResult } from '@vegaprotocol/wallet';
interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData(partyId, gridRef);
  const {
    submit,
    closingOrder,
    closingOrderResult,
    transaction,
    transactionResult,
    Dialog,
  } = useClosePosition();

  return (
    <>
      <AsyncRenderer loading={loading} error={error} data={data || []}>
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
        intent={getDialogIntent(transactionResult)}
        icon={getDialogIcon(transactionResult)}
        title={getDialogTitle(transactionResult)}
        content={{
          Requested: <Requested partyId={partyId} order={closingOrder} />,
          Complete: (
            <Complete
              partyId={partyId}
              closingOrder={closingOrder}
              closingOrderResult={closingOrderResult}
              transaction={transaction}
              transactionResult={transactionResult}
            />
          ),
        }}
      />
    </>
  );
};

const getDialogIntent = (transactionResult?: TransactionResult) => {
  if (!transactionResult) {
    return;
  }

  if (
    transactionResult &&
    'error' in transactionResult &&
    transactionResult.error
  ) {
    return Intent.Danger;
  }

  return Intent.Success;
};

const getDialogIcon = (transactionResult?: TransactionResult) => {
  if (!transactionResult) {
    return;
  }

  if (transactionResult.status) {
    return <Icon name="tick" />;
  }

  return <Icon name="error" />;
};

const getDialogTitle = (transactionResult?: TransactionResult) => {
  if (!transactionResult) {
    return;
  }

  if (transactionResult.status) {
    return t('Position closed');
  }

  return t('Position not closed');
};
