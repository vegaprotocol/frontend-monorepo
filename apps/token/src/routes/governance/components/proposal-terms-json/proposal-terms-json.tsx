import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { ProposalFields_terms } from '../../__generated__/ProposalFields';

export const ProposalTermsJson = ({
  terms,
}: {
  terms: ProposalFields_terms;
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t('proposalTerms')}</h2>
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
