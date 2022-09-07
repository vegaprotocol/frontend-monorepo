import { useTranslation } from 'react-i18next';
import { FormGroup, InputError, TextArea } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { ProposalDocsLink } from './proposal-docs-link';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface ProposalFormTermsProps {
  registerField: UseFormRegisterReturn<'proposalTerms'>;
  errorMessage: string | undefined;
  labelOverride?: string;
}

export const ProposalFormTerms = function ({
  registerField: register,
  errorMessage,
  labelOverride,
}: ProposalFormTermsProps) {
  const { VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  return (
    <FormGroup
      label={labelOverride || t('ProposalTerms')}
      labelFor="proposal-terms"
    >
      <div className="mt-[-4px] mb-2 text-sm font-light">
        {VEGA_DOCS_URL && <ProposalDocsLink url={VEGA_DOCS_URL} />}
      </div>
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
