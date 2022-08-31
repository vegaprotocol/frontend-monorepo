import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useParams } from 'react-router-dom';
import { Proposal } from '../components/proposal';

import { PROPOSAL_FRAGMENT } from '../proposal-fragment';
import type {
  Proposal as ProposalQuery,
  ProposalVariables,
} from './__generated__/Proposal';

const PROPOSAL_QUERY = gql`
  ${PROPOSAL_FRAGMENT}
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      ...ProposalFields
    }
  }
`;

export const ProposalContainer = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const { data, loading, error } = useQuery<ProposalQuery, ProposalVariables>(
    PROPOSAL_QUERY,
    {
      fetchPolicy: 'no-cache',
      pollInterval: 5000,
      skip: !proposalId,
      variables: {
        proposalId: proposalId || '',
      },
    }
  );

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && (
        <Proposal proposal={data.proposal} terms={data.proposal.terms} />
      )}
    </AsyncRenderer>
  );
};
