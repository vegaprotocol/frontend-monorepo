import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import {
  getProposalDialogIcon,
  getProposalDialogIntent,
  getProposalDialogTitle,
} from '../utils';
import { t } from '@vegaprotocol/react-helpers';
import { ProposalState } from '@vegaprotocol/types';
import type { ProposalEvent_busEvents_event_Proposal } from './proposals-hooks';
import type { DialogProps } from '@vegaprotocol/wallet';
import { useTranslation } from 'react-i18next';
import type { UseFormRegister } from 'react-hook-form';

export const ProposalFormMinRequirements = () => {
  const { t } = useTranslation();
  return <p className="mb-4">{t('MinProposalRequirements')}</p>;
};

interface ProposalFormTitleFieldProps<T extends {proposalTitle: string}> {
  register: UseFormRegister<T>;
  errorMessage: string | undefined;
}

export const ProposalFormTitleField = function<T extends {proposalTitle: string}>({
  register,
  errorMessage,
}: ProposalFormTitleFieldProps<T>) {
  return (
    <FormGroup
      label={t('ProposalTitle')}
      labelFor="proposal-title"
      labelDescription={t('ProposalTitleText')}
    >
      <Input
        id="proposal-title"
        maxLength={100}
        hasError={Boolean(errorMessage)}
        data-testid="proposal-title"
        {...register('proposalTitle', {
          required: t('Required'),
        })}
      />
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};

interface ProposalFormSubmitButtonProps {
  isSubmitting: boolean;
}

export const ProposalFormSubmitButton = ({
  isSubmitting,
}: ProposalFormSubmitButtonProps) => (
  <span className="my-20">
    <Button
      variant="primary"
      type="submit"
      data-testid="proposal-submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? t('Submitting') : t('Submit')} {t('Proposal')}
    </Button>
  </span>
);

interface ProposalFormDialogProps {
  finalizedProposal: ProposalEvent_busEvents_event_Proposal | null;
  TransactionDialog: (props: DialogProps) => JSX.Element;
}

export const ProposalFormTransactionDialog = ({
  finalizedProposal,
  TransactionDialog,
}: ProposalFormDialogProps) => (
  <div data-testid="proposal-transaction-dialog">
    {finalizedProposal?.rejectionReason ? (
      <TransactionDialog
        title={t('Proposal rejected')}
        intent={getProposalDialogIntent(ProposalState.STATE_REJECTED)}
        icon={getProposalDialogIcon(ProposalState.STATE_REJECTED)}
      >
        <p>{finalizedProposal.rejectionReason}</p>
      </TransactionDialog>
    ) : (
      <TransactionDialog
        title={getProposalDialogTitle(finalizedProposal?.state)}
        intent={getProposalDialogIntent(finalizedProposal?.state)}
        icon={getProposalDialogIcon(finalizedProposal?.state)}
      />
    )}
  </div>
);
