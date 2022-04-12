import { Button } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TransactionCallout } from '../../../components/transaction-callout';
import type {
  TransactionAction,
  TransactionState,
} from '../../../hooks/transaction-reducer';
import {
  TransactionActionType,
  TxState,
} from '../../../hooks/transaction-reducer';
import type { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';

export const ClaimStep2 = ({
  amount,
  txState,
  txDispatch,
  onSubmit,
}: {
  amount: BigNumber;
  txState: TransactionState;
  txDispatch: React.Dispatch<TransactionAction>;
  onSubmit: () => void;
}) => {
  const { t } = useTranslation();

  if (txState.txState !== TxState.Default) {
    return (
      <div data-testid="claim-step-2">
        <TransactionCallout
          state={txState}
          reset={() => txDispatch({ type: TransactionActionType.TX_RESET })}
        />
      </div>
    );
  }

  return (
    <div data-testid="claim-step-2">
      <Button type="submit" onClick={onSubmit} className="fill">
        {t('Claim {amount} Vega', { amount: formatNumber(amount) })}
      </Button>
    </div>
  );
};
