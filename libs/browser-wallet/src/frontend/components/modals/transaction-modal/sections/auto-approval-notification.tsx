import { Intent, Notification, Tooltip } from '@vegaprotocol/ui-toolkit';

import {
  getTransactionType,
  type TransactionMessage,
} from '@/lib/transactions';
import { useConnectionStore } from '@/stores/connections';

import { AUTO_CONSENT_TRANSACTION_TYPES } from '../../../../lib/constants';

export const locators = {
  autoApprovalMessage: 'auto-approval-message',
  autoApprovalTooltip: 'auto-approval-tooltip',
};

export const TransactionNotAutoApproved = ({
  details,
}: {
  details: TransactionMessage;
}) => {
  const { connections } = useConnectionStore((state) => ({
    connections: state.connections,
  }));
  const connection = connections.find((c) => c.origin === details.origin);
  if (!connection) {
    throw new Error(`Could not find connection with origin ${details.origin}`);
  }
  if (!connection.autoConsent) return null;
  if (
    !AUTO_CONSENT_TRANSACTION_TYPES.includes(
      getTransactionType(details.transaction)
    )
  ) {
    return null;
  }
  return (
    <Notification
      message={
        <Tooltip
          description={
            <span
              data-testid={locators.autoApprovalTooltip}
              style={{ maxWidth: 300 }}
            >
              This transaction was not automatically confirmed because it was
              received while your wallet was locked.
            </span>
          }
        >
          <span data-testid={locators.autoApprovalMessage}>
            Transaction not automatically confirmed
          </span>
        </Tooltip>
      }
      intent={Intent.None}
    />
  );
};
