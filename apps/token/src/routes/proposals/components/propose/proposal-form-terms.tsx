import { useTranslation } from 'react-i18next';
import {
  FormGroup,
  InputError,
  ExternalLink,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import { createDocsLinks } from '@vegaprotocol/utils';
import { useEnvironment } from '@vegaprotocol/environment';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface ProposalFormTermsProps {
  registerField: UseFormRegisterReturn<'proposalTerms'>;
  errorMessage: string | undefined;
  labelOverride?: string;
  docsLink?: string;
}

export const ProposalFormTerms = ({
  registerField: register,
  errorMessage,
  labelOverride,
  docsLink,
}: ProposalFormTermsProps) => {
  const { VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  return (
    <FormGroup
      label={labelOverride || t('ProposalTerms')}
      labelFor="proposal-terms"
    >
      {docsLink && VEGA_DOCS_URL && (
        <div className="mt-[-4px] mb-2 text-sm font-light">
          <span className="mr-1">{t('ProposalTermsText')}</span>
          <ExternalLink
            href={`${
              createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE
            }${docsLink}`}
            target="_blank"
          >
            {`${createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE}${docsLink}`}
          </ExternalLink>
        </div>
      )}

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
