import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
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
      <CollapsibleToggle
        toggleState={showDetails}
        setToggleState={setShowDetails}
        dataTestId="proposal-json-toggle"
      >
        <SubHeading title={t('proposalJson')} />
      </CollapsibleToggle>

      {showDetails && <SyntaxHighlighter data={proposal} />}
    </section>
  );
};
