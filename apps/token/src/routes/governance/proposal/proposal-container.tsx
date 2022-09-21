import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const ProposalNotFound = () => {
  const { t } = useTranslation();
  return (
    <section>
      <header data-testid="proposal-title">
        <h2 className="text-lg mx-0 mt-0 mb-1 font-semibold">
          {t('ProposalNotFound')}
        </h2>
      </header>
      <p>{t('ProposalNotFoundDetails')}</p>
    </section>
  );
};

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();
  const { data, loading, error, refetch } = useQuery<
    ProposalQueryResult,
    ProposalVariables
  >(PROPOSAL_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
  });

  useEffect(() => {
    const interval = setInterval(refetch, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data?.proposal ? (
        <Proposal proposal={data.proposal} />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
