import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import { JsonDiff } from '../../../../components/json-diff';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import type { JsonValue } from '../../../../components/json-diff';

const immutableKeys = [
  'decimalPlaces',
  'positionDecimalPlaces',
  'instrument.name',
  'instrument.future.settlementAsset',
];

export const applyImmutableKeysFromEarlierVersion = (
  earlierVersion: JsonValue,
  updatedVersion: JsonValue
) => {
  if (
    typeof earlierVersion !== 'object' ||
    earlierVersion === null ||
    typeof updatedVersion !== 'object' ||
    updatedVersion === null
  ) {
    // If either version is not an object or is null, return null or throw an error
    return {};
  }

  const updatedVersionCopy = cloneDeep(updatedVersion);

  // Overwrite the immutable keys in the updatedVersionCopy with the earlier values
  immutableKeys.forEach((key) => {
    set(updatedVersionCopy, key, get(earlierVersion, key));
  });

  return updatedVersionCopy;
};

interface ProposalMarketChangesProps {
  originalProposal: JsonValue;
  latestEnactedProposal: JsonValue | undefined;
  updatedProposal: JsonValue;
}

export const ProposalMarketChanges = ({
  originalProposal,
  latestEnactedProposal,
  updatedProposal,
}: ProposalMarketChangesProps) => {
  const { t } = useTranslation();
  const [showChanges, setShowChanges] = useState(false);

  return (
    <section data-testid="proposal-market-changes">
      <CollapsibleToggle
        toggleState={showChanges}
        setToggleState={setShowChanges}
        dataTestId={'proposal-market-changes-toggle'}
      >
        <SubHeading title={t('updatesToMarket')} />
      </CollapsibleToggle>

      {showChanges && (
        <div className="mb-6">
          <JsonDiff
            left={latestEnactedProposal || originalProposal}
            right={
              latestEnactedProposal
                ? applyImmutableKeysFromEarlierVersion(
                    latestEnactedProposal,
                    updatedProposal
                  )
                : applyImmutableKeysFromEarlierVersion(
                    originalProposal,
                    updatedProposal
                  )
            }
          />
        </div>
      )}
    </section>
  );
};
