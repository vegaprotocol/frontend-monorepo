import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
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
      <SubHeading title={t('proposalTerms')} />
      <SyntaxHighlighter data={terms} />
    </section>
  );
};
