import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { PartialDeep } from 'type-fest';
import type * as Schema from '@vegaprotocol/types';

export const ProposalTermsJson = ({
  terms,
}: {
  terms: PartialDeep<Schema.ProposalTerms>;
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t('proposalTerms')}</h2>
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
