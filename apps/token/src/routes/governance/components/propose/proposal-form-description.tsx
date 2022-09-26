import { useTranslation } from 'react-i18next';
import { FormGroup, InputError, TextArea } from '@vegaprotocol/ui-toolkit';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface ProposalFormDescriptionProps {
  registerField: UseFormRegisterReturn<'proposalDescription'>;
  errorMessage: string | undefined;
}

export const ProposalFormDescription = ({
  registerField: register,
  errorMessage,
}: ProposalFormDescriptionProps) => {
  const { t } = useTranslation();
  return (
    <FormGroup
      label={t('ProposalDescription')}
      labelDescription={t('ProposalDescriptionText')}
      labelFor="proposal-description"
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
