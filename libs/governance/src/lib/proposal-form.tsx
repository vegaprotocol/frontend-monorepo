import {
  Button,
  FormGroup,
  InputError,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { useProposalSubmit } from './proposals-hooks';
import {
  getProposalDialogIcon,
  getProposalDialogIntent,
  getProposalDialogTitle,
} from '../utils';
import { t } from '@vegaprotocol/react-helpers';

export interface FormFields {
  proposalData: string;
}

export const ProposalForm = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const hasError = Boolean(errors.proposalData?.message);

  const onSubmit = async (fields: FormFields) => {
    await submit(JSON.parse(fields.proposalData));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup
        label="Make a proposal by submitting JSON"
        labelFor="proposal-data"
      >
        <TextArea
          id="proposal-data"
          className="min-h-[200px]"
          hasError={hasError}
          data-testid="proposal-data"
          {...register('proposalData', {
            required: t('Required'),
            validate: {
              validateJson: (value) => {
                try {
                  JSON.parse(value);
                  return true;
                } catch (e) {
                  return t('Must be valid JSON');
                }
              },
            },
          })}
        />
        {errors.proposalData?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.proposalData?.message}
          </InputError>
        )}
      </FormGroup>
      <Button
        variant="primary"
        type="submit"
        className="my-20"
        data-testid="proposal-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('Submitting') : t('Submit')} {t('Proposal')}
      </Button>
      <TransactionDialog
        title={getProposalDialogTitle(finalizedProposal?.state)}
        intent={getProposalDialogIntent(finalizedProposal?.state)}
        icon={getProposalDialogIcon(finalizedProposal?.state)}
      />
    </form>
  );
};
