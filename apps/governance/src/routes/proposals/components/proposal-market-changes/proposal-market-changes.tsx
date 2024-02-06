import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import { JsonDiff } from '../../../../components/json-diff';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import type { JsonValue } from '../../../../components/json-diff';
import { useFetch } from '@vegaprotocol/react-helpers';
import { ENV } from '../../../../config';

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
  marketId: string;
  updatedProposal: JsonValue;
}

export const ProposalMarketChanges = ({
  marketId,
  updatedProposal,
}: ProposalMarketChangesProps) => {
  const { t } = useTranslation();
  const [showChanges, setShowChanges] = useState(false);

  const {
    state: { data },
  } = useFetch(`${ENV.rest}governance?proposalId=${marketId}`, undefined, true);

  const {
    state: { data: enactedProposalData },
  } = useFetch(
    `${ENV.rest}governances?proposalState=STATE_ENACTED&proposalType=TYPE_UPDATE_MARKET`,
    undefined,
    true
  );

  // @ts-ignore no types here :-/
  const enacted = enactedProposalData?.connection?.edges
    .filter(
      // @ts-ignore no type here
      ({ node }) => node?.proposal?.terms?.updateMarket?.marketId === marketId
    )
    // @ts-ignore no type here
    .sort((a, b) => {
      return (
        new Date(a?.node?.terms?.enactmentTimestamp).getTime() -
        new Date(b?.node?.terms?.enactmentTimestamp).getTime()
      );
    });

  const latestEnactedProposal = enacted[enacted.length - 1];

  const originalProposal =
    // @ts-ignore no types with useFetch TODO: check this is good
    data?.data?.proposal?.terms?.newMarket?.changes;

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
