import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { DeepPartial } from '@vegaprotocol/react-helpers'
import * as Schema from '@vegaprotocol/types'

export const ProposalTermsJson = ({
  terms,
}: {
  terms: DeepPartial<Schema.ProposalTerms>;
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t('proposalTerms')}</h2>
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
