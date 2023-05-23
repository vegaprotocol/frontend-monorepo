import { useMemo } from 'react';
import { ProtocolUpgradeProposalDetailHeader } from '../components/protocol-upgrade-proposal-detail-header';
import { ProtocolUpdateProposalDetailApprovals } from '../components/protocol-upgrade-proposal-detail-approvals';
import { ProtocolUpgradeProposalDetailInfo } from '../components/protocol-upgrade-proposal-detail-info';
import { getNormalisedVotingPower } from '../../staking/shared';
import type { NodesFragmentFragment } from '../../staking/home/__generated__/Nodes';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { useVegaRelease } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

export interface ProtocolUpgradeProposalProps {
  proposal: ProtocolUpgradeProposalFieldsFragment;
  consensusValidators: NodesFragmentFragment[] | null;
  lastBlockHeight?: string;
}

export const getConsensusApprovals = (
  consensusValidators: NodesFragmentFragment[],
  proposal: ProtocolUpgradeProposalFieldsFragment
) =>
  consensusValidators?.filter(({ pubkey }) =>
    proposal.approvers?.includes(pubkey)
  );

export const getConsensusApprovalsVotingPower = (
  consensusValidators: NodesFragmentFragment[]
) =>
  consensusValidators?.reduce<number>(
    (acc: number, curr: NodesFragmentFragment) => {
      return acc + Number(curr.rankingScore.votingPower);
    },
    0
  );

export const getConsensusApprovalsVotingPowerPercentage = (
  consensusApprovalsVotingPower: number
) =>
  consensusApprovalsVotingPower > 0
    ? getNormalisedVotingPower(consensusApprovalsVotingPower.toString(), 2)
    : '0%';

export const ProtocolUpgradeProposal = ({
  proposal,
  lastBlockHeight,
  consensusValidators,
}: ProtocolUpgradeProposalProps) => {
  const { t } = useTranslation();
  const releaseInfo = useVegaRelease(proposal.vegaReleaseTag);

  const consensusApprovals = useMemo(
    () => getConsensusApprovals(consensusValidators || [], proposal),
    [consensusValidators, proposal]
  );

  const consensusApprovalsVotingPower = useMemo(
    () => getConsensusApprovalsVotingPower(consensusApprovals || []),
    [consensusApprovals]
  );

  const consensusApprovalsVotingPowerPercentage = useMemo(
    () =>
      getConsensusApprovalsVotingPowerPercentage(consensusApprovalsVotingPower),
    [consensusApprovalsVotingPower]
  );

  return (
    <section data-testid="protocol-upgrade-proposal">
      <ProtocolUpgradeProposalDetailHeader
        releaseTag={proposal.vegaReleaseTag}
      />

      <ProtocolUpgradeProposalDetailInfo
        proposal={proposal}
        lastBlockHeight={lastBlockHeight}
      />

      {consensusValidators && consensusApprovals && (
        <ProtocolUpdateProposalDetailApprovals
          consensusApprovals={consensusApprovals}
          consensusApprovalsVotingPowerPercentage={
            consensusApprovalsVotingPowerPercentage
          }
          totalConsensusValidators={consensusValidators.length}
        />
      )}

      {releaseInfo && releaseInfo.htmlUrl && (
        <div className="mb-10">
          <ExternalLink href={releaseInfo.htmlUrl}>
            {t('Explore release on GitHub')}
          </ExternalLink>
        </div>
      )}
    </section>
  );
};
