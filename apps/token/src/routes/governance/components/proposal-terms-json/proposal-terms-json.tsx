import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { Proposal_proposal_terms } from '@vegaprotocol/governance';

export const ProposalTermsJson = ({
  terms,
}: {
  terms: Proposal_proposal_terms;
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t('proposalTerms')}</h2>
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
