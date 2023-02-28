import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import type {
  TransactionAction,
  TransactionState,
} from '../../../hooks/transaction-reducer';
import { ClaimForm } from '../claim-form';

interface ClaimStep2 {
  countryCode: string;
  txState: TransactionState;
  txDispatch: React.Dispatch<TransactionAction>;
  completed: boolean;
  onSubmit: () => void;
}

export const ClaimStep1 = ({
  countryCode,
  txState,
  txDispatch,
  completed,
  onSubmit,
}: ClaimStep2) => {
  const { t } = useTranslation();
  return (
    <div data-testid="claim-step-1">
      {completed ? (
        <Callout intent={Intent.Success} title={t('Complete')} iconName="tick">
          <p>You have already committed your claim</p>
        </Callout>
      ) : (
        <>
          <p>{t('commitBody')}</p>
          <ClaimForm
            countryCode={countryCode}
            txState={txState}
            txDispatch={txDispatch}
            onSubmit={onSubmit}
          />
        </>
      )}
    </div>
  );
};
