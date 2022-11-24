import { useRef } from 'react';
import { AsyncRenderer, Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { useClosePosition, usePositionsData, PositionsTable } from '../';
import type { AgGridReact } from 'ag-grid-react';
import { Requested } from './close-position-dialog/requested';
import { Complete } from './close-position-dialog/complete';
import type { TransactionResult } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/react-helpers';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading } = usePositionsData(partyId, gridRef);
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
      <AsyncRenderer loading={loading} error={error} data={data}>
        <PositionsTable
          ref={gridRef}
          rowData={data}
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
