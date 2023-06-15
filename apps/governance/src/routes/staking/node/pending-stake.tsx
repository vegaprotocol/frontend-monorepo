import React from 'react';
import * as Sentry from '@sentry/react';
import { Button, Callout, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import type { BigNumber } from '../../../lib/bignumber';
import type { UndelegateSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { removeDecimal } from '@vegaprotocol/utils';
import { vega as VegaProtos } from '@vegaprotocol/protos';

interface PendingStakeProps {
  pendingAmount: BigNumber;
  nodeId: string;
  pubKey: string;
}

enum FormState {
  Default,
  Pending,
  Success,
  Failure,
}

export const PendingStake = ({
  pendingAmount,
  nodeId,
  pubKey,
}: PendingStakeProps) => {
  const { t } = useTranslation();
  const { sendTx } = useVegaWallet();
  const { appState } = useAppState();
  const [formState, setFormState] = React.useState(FormState.Default);

  const removeStakeNow = async () => {
    setFormState(FormState.Pending);
    try {
      const command: UndelegateSubmissionBody = {
        undelegateSubmission: {
          nodeId,
          amount: removeDecimal(pendingAmount.toString(), appState.decimals),
          method: VegaProtos.commands.v1.UndelegateSubmission.Method.METHOD_NOW,
        },
      };
      await sendTx(pubKey, command);
    } catch (err) {
      setFormState(FormState.Failure);
      Sentry.captureException(err);
    }
  };

  if (formState === FormState.Failure) {
    return (
      <Callout
        intent={Intent.Danger}
        title={t('failedToRemovePendingStake', { pendingAmount })}
      >
        <p>{t('pleaseTryAgain')}</p>
      </Callout>
    );
  } else if (formState === FormState.Pending) {
    return (
      <Callout
        icon={<Loader size="small" />}
        title={t('removingPendingStake', { pendingAmount })}
      />
    );
  }

  return (
    <div className="py-4">
      <h2>{t('pendingNomination')}</h2>
      <p>{t('pendingNominationNextEpoch', { pendingAmount })}</p>
      <Button onClick={() => removeStakeNow()}>
        {t('cancelPendingEpochNomination')}
      </Button>
    </div>
  );
};
