import type { ProtocolUpgradeProposalsQuery } from './__generated__/ProtocolUpgradeProposals';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const protocolUpgradeProposalsQuery = (
  override?: PartialDeep<ProtocolUpgradeProposalsQuery>
): ProtocolUpgradeProposalsQuery => {
  const defaultResult: ProtocolUpgradeProposalsQuery = {
    lastBlockHeight: '100',
  };

  return merge(defaultResult, override);
};
