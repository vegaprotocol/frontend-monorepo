import {
  Button,
  // Checkbox,
  Intent,
} from '@vegaprotocol/ui-toolkit';
// import { useState } from 'react';

// import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
// import { RpcMethods } from '@/lib/client-rpc-methods';
import {
  // getTransactionType,
  type TransactionMessage,
} from '@/lib/transactions';
// import { useConnectionStore } from '@/stores/connections';

// import { AUTO_CONSENT_TRANSACTION_TYPES } from '../../../lib/constants';

export const locators = {
  transactionModalDenyButton: 'transaction-deny-button',
  transactionModalApproveButton: 'transaction-approve-button',
  transactionModalFooterAutoConsentSection: 'transaction-autoconsent-section',
};

export const TransactionModalFooter = ({
  handleTransactionDecision,
  details,
}: {
  handleTransactionDecision: (decision: boolean) => void;
  details: TransactionMessage;
}) => {
  // const { request } = useJsonRpcClient();
  // const { connections, loadConnections } = useConnectionStore((state) => ({
  //   connections: state.connections,
  //   loadConnections: state.loadConnections,
  // }));
  // const connection = connections.find((c) => c.origin === details.origin);
  // if (!connection) {
  //   throw new Error(`Could not find connection with origin ${details.origin}`);
  // }
  // const [autoConsent, setAutoConsent] = useState(connection.autoConsent);

  const handleDecision = async (decision: boolean) => {
    handleTransactionDecision(decision);
    // TODO should be powered by a setting and not the connection
    // if (connection && autoConsent !== connection.autoConsent) {
    //   await request(RpcMethods.UpdateAutomaticConsent, {
    //     origin: connection.origin,
    //     autoConsent,
    //   });
    //   await loadConnections(request);
    // }
  };

  return (
    <div className="fixed bottom-0 py-4 bg-surface-1 z-[15] px-5 border-t border-surface-0-fg-muted w-full">
      <div className="grid grid-cols-[1fr_1fr] justify-between gap-4">
        <Button
          data-testid={locators.transactionModalDenyButton}
          onClick={() => handleDecision(false)}
        >
          Reject
        </Button>
        <Button
          data-testid={locators.transactionModalApproveButton}
          intent={Intent.Primary}
          onClick={() => handleDecision(true)}
        >
          Confirm
        </Button>
      </div>
      {/* {!connection.autoConsent &&
        AUTO_CONSENT_TRANSACTION_TYPES.includes(
          getTransactionType(details.transaction)
        ) && (
          <div
            className="mt-2"
            data-testid={locators.transactionModalFooterAutoConsentSection}
          >
            <Checkbox
              label={
                <span className="text-xs">
                  Allow this site to automatically approve order and vote
                  transactions. This can be turned off in "Connections".
                </span>
              }
              checked={autoConsent}
              onCheckedChange={() => {
                setAutoConsent(!autoConsent);
              }}
              name={'autoConsent'}
            />
          </div>
        )} */}
    </div>
  );
};
