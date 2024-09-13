import { Button, Checkbox, Intent } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import {
  getTransactionType,
  type TransactionMessage,
} from '@/lib/transactions';
import { useGlobalsStore } from '@/stores/globals';
import { AUTO_CONSENT_TRANSACTION_TYPES } from '@/lib/constants';

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
  const { request } = useJsonRpcClient();
  const { settings, loadGlobals } = useGlobalsStore((state) => ({
    settings: state.globals?.settings,
    loadGlobals: state.loadGlobals,
  }));
  const [autoConsent, setAutoConsent] = useState(!!settings?.autoConsent);
  if (!settings) return null;

  const handleDecision = async (decision: boolean) => {
    handleTransactionDecision(decision);
    // TODO should be powered by a setting and not the connection
    if (autoConsent !== settings.autoConsent) {
      await request(RpcMethods.UpdateSettings, {
        autoConsent,
      });
      await loadGlobals(request);
    }
  };

  const showAutoConsent =
    !settings.autoConsent &&
    AUTO_CONSENT_TRANSACTION_TYPES.includes(
      getTransactionType(details.transaction)
    );

  return (
    <div
      className="relative py-4 bg-surface-1 z-[20] px-5 border-t border-surface-0-fg-muted"
      style={{ top: showAutoConsent ? -112 : -72 }}
    >
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
      {showAutoConsent && (
        <div
          className="mt-2"
          data-testid={locators.transactionModalFooterAutoConsentSection}
        >
          <Checkbox
            label={
              <span className="text-xs">
                Allow this site to automatically approve order and vote
                transactions. This can be turned off in "Settings".
              </span>
            }
            checked={autoConsent}
            onCheckedChange={() => {
              setAutoConsent(!autoConsent);
            }}
            name={'autoConsent'}
          />
        </div>
      )}
    </div>
  );
};
