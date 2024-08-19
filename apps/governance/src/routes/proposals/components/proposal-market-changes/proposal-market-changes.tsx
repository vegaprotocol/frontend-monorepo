import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { JsonDiff, type JsonValue } from '../../../../components/json-diff';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import {
  useFetchProposal,
  useFetchProposals,
  flatten,
  isBatchProposalNode,
  isSingleProposalNode,
  type ProposalNode,
  type SingleProposalData,
  type SubProposalData,
} from '../proposal/proposal-utils';
import { MarketName } from '../proposal/market-name';

const immutableKeys = [
  // immutable fields from UpdateMarket proposal
  'decimalPlaces',
  'positionDecimalPlaces',
  'instrument.name',
  'instrument.future.settlementAsset',
  // immutable fields from UpdateSpotMarket proposal
  'instrument.spot',
  'priceDecimalPlaces',
  'sizeDecimalPlaces',
];

export const applyImmutableKeysFromEarlierVersion = (
  earlierVersion: unknown,
  updatedVersion: unknown
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
    const earlier = get(earlierVersion, key);
    if (earlier) set(updatedVersionCopy, key, earlier);
  });

  return updatedVersionCopy;
};

interface ProposalMarketChangesProps {
  marketId: string;
  /** This are the changes from proposal */
  updateProposalNode: ProposalNode | null;
  indicator?: number;
}

export const ProposalMarketChanges = ({
  marketId,
  updateProposalNode,
  indicator,
}: ProposalMarketChangesProps) => {
  const { t } = useTranslation();
  const [showChanges, setShowChanges] = useState(false);

  const { data: originalProposalData } = useFetchProposal({
    proposalId: marketId,
  });

  const { data: enactedProposalsData } = useFetchProposals({
    proposalState: 'STATE_ENACTED',
    proposalType: 'TYPE_UPDATE_MARKET',
  });

  const { data: enactedSpotProposalsData } = useFetchProposals({
    proposalState: 'STATE_ENACTED',
    proposalType: 'TYPE_UPDATE_SPOT_MARKET',
  });

  let updateProposal: SingleProposalData | SubProposalData | undefined;
  if (isBatchProposalNode(updateProposalNode)) {
    updateProposal = updateProposalNode.proposals.find(
      (p, i) =>
        (p.terms.updateMarket?.marketId === marketId ||
          p.terms.updateSpotMarket?.marketId === marketId) &&
        (indicator != null ? i === indicator - 1 : true)
    );
  }
  if (isSingleProposalNode(updateProposalNode)) {
    updateProposal = updateProposalNode.proposal;
  }

  // this should get the proposal before the current one
  const enactedUpdateMarketProposals = orderBy(
    compact(
      flatten([...enactedProposalsData, ...enactedSpotProposalsData]).filter(
        (enacted) => {
          const related =
            enacted.terms.updateMarket?.marketId === marketId ||
            enacted.terms.updateSpotMarket?.marketId === marketId;
          const notCurrent =
            enacted.id !== updateProposal?.id ||
            ('batchId' in enacted && enacted.batchId !== updateProposal.id);
          const beforeCurrent =
            Number(enacted.terms.enactmentTimestamp) <
            Number(updateProposal?.terms.enactmentTimestamp);
          return related && notCurrent && beforeCurrent;
        }
      )
    ),
    [(proposal) => Number(proposal.terms.enactmentTimestamp)],
    'desc'
  );

  const latestEnactedProposal =
    enactedUpdateMarketProposals.length > 0
      ? enactedUpdateMarketProposals[0]
      : undefined;

  let originalProposal;
  if (isBatchProposalNode(originalProposalData)) {
    originalProposal = originalProposalData.proposals.find(
      (proposal) =>
        proposal.id === marketId &&
        (proposal.terms.newMarket != null ||
          proposal.terms.newSpotMarket != null)
    );
  }
  if (isSingleProposalNode(originalProposalData)) {
    originalProposal = originalProposalData.proposal;
  }

  // LEFT SIDE: update market proposal enacted just before this one
  // or original new market proposal
  const left =
    latestEnactedProposal?.terms.updateMarket?.changes ||
    latestEnactedProposal?.terms.updateSpotMarket?.changes ||
    originalProposal?.terms.newMarket?.changes ||
    originalProposal?.terms.newSpotMarket?.changes;

  // RIGHT SIDE: this update market proposal
  const right = applyImmutableKeysFromEarlierVersion(
    left,
    updateProposal?.terms.updateMarket?.changes ||
      updateProposal?.terms.updateSpotMarket?.changes
  );

  return (
    <section data-testid="proposal-market-changes">
      <CollapsibleToggle
        toggleState={showChanges}
        setToggleState={setShowChanges}
        dataTestId={'proposal-market-changes-toggle'}
      >
        <SubHeading
          title={
            <>
              {t('UpdateToMarket')}: <MarketName marketId={marketId} truncate />
            </>
          }
        />
      </CollapsibleToggle>

      {showChanges && (
        <div className="mb-6 bg-surface-2 p-2 rounded-lg">
          <JsonDiff left={left as JsonValue} right={right as JsonValue} />
        </div>
      )}
    </section>
  );
};
