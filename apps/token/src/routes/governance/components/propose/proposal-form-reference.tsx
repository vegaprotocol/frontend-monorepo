import { useTranslation } from 'react-i18next';
import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface ProposalFormReferenceProps {
  registerField: UseFormRegisterReturn<'proposalReference'>;
  errorMessage: string | undefined;
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
