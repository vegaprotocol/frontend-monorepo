import * as Schema from '@vegaprotocol/types';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useMemo } from 'react';
import first from 'lodash/first';
import { proposalsDataProvider } from '../proposals-data-provider';
import type {
  BatchproposalListFieldsFragment,
  ProposalListFieldsFragment,
} from '../proposals-data-provider';

type UseUpdateProposalProps = {
  id?: string;
  proposalType:
    | Schema.ProposalType.TYPE_UPDATE_ASSET
    | Schema.ProposalType.TYPE_UPDATE_MARKET;
};

type UseUpdateProposal = {
  data:
    | ProposalListFieldsFragment
    | BatchproposalListFieldsFragment
    | undefined;
  loading: boolean;
  error: Error | undefined;
};

export const useAssetUpdateProposal = ({
  id,
  proposalType,
}: UseUpdateProposalProps): UseUpdateProposal => {
  const variables = useMemo(
    () => ({
      proposalType,
      skipUpdates: true,
    }),
    [proposalType]
  );

  const { data, loading, error } = useDataProvider({
    dataProvider: proposalsDataProvider,
    variables,
  });

  const openAssetProposals = (data || []).filter((proposal) => {
    if (
      ![
        Schema.ProposalState.STATE_OPEN,
        Schema.ProposalState.STATE_PASSED,
        Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
      ].includes(proposal.state)
    ) {
      return false;
    }

    if (proposal.__typename === 'Proposal') {
      if (
        proposal.terms.change.__typename === 'UpdateAsset' &&
        proposal.terms.change.assetId === id
      ) {
        return true;
      }
    }

    if (proposal.__typename === 'BatchProposal') {
      const assetChange = proposal?.subProposals?.find(
        (p) => p?.terms?.change.__typename === 'UpdateAsset'
      );

      if (
        assetChange &&
        assetChange.terms?.change.__typename === 'UpdateAsset' &&
        assetChange.terms.change.assetId === id
      ) {
        return true;
      }
    }

    return false;
  });

  const proposal = first(openAssetProposals);

  return { data: proposal, loading, error };
};
