import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { collapsibleToggleStyles } from '../../../../lib/collapsible-toggle-styles';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

export const ProposalJson = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section data-testid="proposal-json">
      <button
        onClick={() => setShowDetails(!showDetails)}
        data-testid="proposal-json-toggle"
      >
        <div className="flex items-center gap-3">
          <SubHeading title={t('proposalJson')} />
          <div className={collapsibleToggleStyles(showDetails)}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {showDetails && <SyntaxHighlighter data={proposal} />}
    </section>
  );
};
