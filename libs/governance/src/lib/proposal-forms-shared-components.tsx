import { useTranslation } from 'react-i18next';
import type { DialogProps } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import {
  getProposalDialogIcon,
  getProposalDialogIntent,
  getProposalDialogTitle,
} from '../utils';
import { ProposalState } from '@vegaprotocol/types';
import type { ProposalEvent_busEvents_event_Proposal } from './proposals-hooks';
import type { UseFormRegisterReturn } from 'react-hook-form';

type ErrorMessage = string | undefined;

export const ProposalFormMinRequirements = () => {
  const { t } = useTranslation();
  return <p className="mb-4">{t('MinProposalRequirements')}</p>;
};

interface ProposalFormTitleProps {
  registerField: UseFormRegisterReturn<'proposalTitle'>;
  errorMessage: ErrorMessage;
}

export const ProposalFormTitle = function ({
  registerField: register,
  errorMessage,
}: ProposalFormTitleProps) {
  const { t } = useTranslation();
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
        {...register}
      />
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};

interface ProposalFormDescriptionProps {
  registerField: UseFormRegisterReturn<'proposalDescription'>;
  errorMessage: ErrorMessage;
}

export const ProposalFormDescription = function ({
  registerField: register,
  errorMessage,
}: ProposalFormDescriptionProps) {
  const { t } = useTranslation();
  return (
    <FormGroup
      label={t('ProposalDescription')}
      labelFor="proposal-description"
      labelDescription={t('ProposalDescriptionText')}
    >
      <TextArea
        id="proposal-description"
        maxLength={20000}
        className="min-h-[200px]"
        hasError={Boolean(errorMessage)}
        data-testid="proposal-description"
        {...register}
      />
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};

interface ProposalFormTermsProps {
  registerField: UseFormRegisterReturn<'proposalTerms'>;
  errorMessage: ErrorMessage;
}

export const ProposalFormTerms = function ({
  registerField: register,
  errorMessage,
}: ProposalFormTermsProps) {
  const { t } = useTranslation();
  return (
    <FormGroup
      label={t('ProposalTerms')}
      labelDescription={t('ProposalTermsText')}
      labelFor="proposal-terms"
    >
      <TextArea
        id="proposal-terms"
        className="min-h-[200px]"
        hasError={Boolean(errorMessage)}
        data-testid="proposal-terms"
        {...register}
      />
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};

interface ProposalFormReferenceProps {
  registerField: UseFormRegisterReturn<'proposalReference'>;
  errorMessage: ErrorMessage;
}

export const ProposalFormReference = function ({
  registerField: register,
  errorMessage,
}: ProposalFormReferenceProps) {
  const { t } = useTranslation();
  return (
    <FormGroup label={t('ProposalReference')} labelFor="proposal-reference">
      <Input
        id="proposal-reference"
        maxLength={100}
        hasError={Boolean(errorMessage)}
        data-testid="proposal-reference"
        {...register}
      />
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};

interface ProposalFormSubmitProps {
  isSubmitting: boolean;
}

export const ProposalFormSubmit = ({
  isSubmitting,
}: ProposalFormSubmitProps) => {
  const { t } = useTranslation();
  return (
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
};

interface ProposalFormTransactionDialogProps {
  finalizedProposal: ProposalEvent_busEvents_event_Proposal | null;
  TransactionDialog: (props: DialogProps) => JSX.Element;
}

export const ProposalFormTransactionDialog = ({
  finalizedProposal,
  TransactionDialog,
}: ProposalFormTransactionDialogProps) => (
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
