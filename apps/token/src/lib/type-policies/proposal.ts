import type { Proposals_proposals } from '../../routes/governance/proposals/__generated__/Proposals';

export function getProposalName(proposal: Proposals_proposals) {
  const { change } = proposal.terms;

  if (change.__typename === 'NewAsset') {
    return `New Asset: ${change.symbol}`;
  } else if (change.__typename === 'NewMarket') {
    return `New Market: ${change.instrument.name}`;
  } else if (change.__typename === 'UpdateMarket') {
    return `Update Market: ${change.marketId}`;
  } else if (change.__typename === 'UpdateNetworkParameter') {
    return `Update Network: ${change.networkParameter.key}`;
  } else if (change.__typename === 'NewFreeform') {
    return `Freeform: ${proposal.rationale.hash}`;
  }

  return 'Unknown Proposal';
}
