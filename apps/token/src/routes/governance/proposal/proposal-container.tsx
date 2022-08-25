import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { PROPOSALS_FRAGMENT } from '../proposal-fragment';
import type {
  Proposal as ProposalQueryResult,
  ProposalVariables,
} from './__generated__/Proposal';

export const PROPOSAL_QUERY = gql`
  ${PROPOSALS_FRAGMENT}
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      ...ProposalFields
    }
  }
`;

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();

  const { data, loading, error } = useQuery<
    ProposalQueryResult,
    ProposalVariables
  >(PROPOSAL_QUERY, {
    fetchPolicy: 'no-cache',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
    pollInterval: 5000,
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && (
        <Proposal proposal={data.proposal} terms={data.proposal.terms} />
      )}
    </AsyncRenderer>
  );
};
