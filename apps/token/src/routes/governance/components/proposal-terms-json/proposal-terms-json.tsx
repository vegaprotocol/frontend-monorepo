import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { RestProposalResponse } from '../../proposal/proposal-container';

export const ProposalTermsJson = ({
  terms,
}: {
  terms: RestProposalResponse;
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t('proposalTerms')}</h2>
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
