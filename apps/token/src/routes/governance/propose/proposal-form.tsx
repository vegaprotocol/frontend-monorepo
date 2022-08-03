import { Button, FormGroup, TextArea } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

interface ProposalFormProps {
  onSubmit: (formFields: FormFields) => void;
}

export interface FormFields {
  proposalData: string;
}

export const ProposalForm = ({ onSubmit }: ProposalFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>();
  const { t } = useTranslation();

  const hasError = !!errors.proposalData?.message;

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
    </form>
  );
};
