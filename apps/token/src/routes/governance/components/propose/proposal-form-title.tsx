import { useTranslation } from 'react-i18next';
import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface ProposalFormTitleProps {
  registerField: UseFormRegisterReturn<'proposalTitle'>;
  errorMessage: string | undefined;
}

export const ProposalFormTitle = ({
  registerField: register,
  errorMessage,
}: ProposalFormTitleProps) => {
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
