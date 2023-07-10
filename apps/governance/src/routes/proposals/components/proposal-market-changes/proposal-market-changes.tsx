import { JsonDiff } from '../../../../components/json-diff';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import type { JsonValue } from '../../../../components/json-diff';

interface ProposalMarketChangesProps {
  previousProposal: JsonValue;
  updatedProposal: JsonValue;
  objectHash?: (obj: unknown) => string | undefined;
}

export const ProposalMarketChanges = ({
  previousProposal,
  updatedProposal,
  objectHash,
}: ProposalMarketChangesProps) => {
  const { t } = useTranslation();
  const [showChanges, setShowChanges] = useState(false);

  return (
    <section data-testid="proposal-market-changes">
      <CollapsibleToggle
        toggleState={showChanges}
        setToggleState={setShowChanges}
        dataTestId={'proposal-description-toggle'}
      >
        <SubHeading title={t('updatesToMarket')} />
      </CollapsibleToggle>

      {showChanges && (
        <div className="mb-6">
          <JsonDiff
            left={previousProposal}
            right={updatedProposal}
            objectHash={objectHash}
          />
        </div>
      )}
    </section>
  );
};
