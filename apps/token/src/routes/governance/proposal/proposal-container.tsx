import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { PROPOSAL_FRAGMENT } from '../proposal-fragment';
import type {
  Proposal as ProposalQueryResult,
  ProposalVariables,
} from './__generated__/Proposal';

export const PROPOSAL_QUERY = gql`
  ${PROPOSAL_FRAGMENT}
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      ...ProposalFields
    }
  }
`;

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();
  const { data, loading, error, refetch } = useQuery<
    ProposalQueryResult,
    ProposalVariables
  >(PROPOSAL_QUERY, {
    fetchPolicy: 'network-only',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
  });

  useEffect(() => {
    const interval = setInterval(refetch, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && data.proposal && <Proposal proposal={data.proposal} />}
    </AsyncRenderer>
  );
};
