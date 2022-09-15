import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { ProposalFieldsFragment } from '@vegaprotocol/governance';

export const ProposalTermsJson = ({
  terms,
}: {
  terms: ProposalFieldsFragment['terms'];
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t('proposalTerms')}</h2>
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
