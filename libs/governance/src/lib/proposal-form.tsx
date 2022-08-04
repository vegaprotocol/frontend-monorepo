import { Button, FormGroup, TextArea } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useProposalSubmit } from './proposals-hooks';
import {
  getProposalDialogIcon,
  getProposalDialogIntent,
  getProposalDialogTitle,
} from '../utils';
import { VegaTxStatus } from '@vegaprotocol/wallet';

export interface FormFields {
  proposalData: string;
}

export const ProposalForm = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>();
  const { finalizedProposal, submit, transaction, TransactionDialog } =
    useProposalSubmit();

  const { t } = useTranslation();

  const hasError = !!errors.proposalData?.message;

  const onSubmit = async (fields: FormFields) => {
    if (
      transaction.status !== VegaTxStatus.Requested ||
      (transaction.status && VegaTxStatus.Pending)
    ) {
      await submit(JSON.parse(fields.proposalData));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup
        label="Make a proposal by submitting JSON"
        labelFor="proposal-data"
        labelDescription={errors.proposalData?.message}
        hasError={hasError}
      >
        <TextArea
          id="proposal-data"
          className="min-h-[200px]"
          hasError={hasError}
          {...register('proposalData', {
            required: t('required'),
            validate: {
              validateJson: (value) => {
                try {
                  JSON.parse(value);
                  return true;
                } catch (e) {
                  return t('MustBeValidJson');
                }
              },
            },
          })}
        />
        <Button variant="primary" type="submit" className="my-20">
          {isSubmitting ? t('submitting') : t('submit')} {t('proposal')}
        </Button>
      </FormGroup>
      <TransactionDialog
        title={getProposalDialogTitle(finalizedProposal?.state)}
        intent={getProposalDialogIntent(finalizedProposal?.state)}
        icon={getProposalDialogIcon(finalizedProposal?.state)}
      />
    </form>
  );
};
