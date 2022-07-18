import { gql, useQuery } from '@apollo/client';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { SplashLoader } from '../../../components/splash-loader';
import { useFetch } from '@vegaprotocol/react-helpers';
import { getDataNodeUrl } from '../../../lib/get-data-node-url';
import { Proposal } from '../components/proposal';
import { PROPOSALS_FRAGMENT } from '../proposal-fragment';
import type {
  Proposal as ProposalQueryResult,
  ProposalVariables,
} from './__generated__/Proposal';
import { ENV } from '../../../config/env';

/**
 * TODO: how do we do this properly to ensure that it is kept up to date?
 */
export interface RestProposalResponse {
  data: {
    proposal: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      terms: any;
    };
  };
}

export const PROPOSAL_QUERY = gql`
  ${PROPOSALS_FRAGMENT}
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      ...ProposalFields
    }
  }
`;

export const ProposalContainer = () => {
  const { t } = useTranslation();
  const params = useParams<{ proposalId: string }>();
  const { base } = getDataNodeUrl();
  const proposalUrl = React.useMemo(
    () =>
      new URL(`${ENV.restUrl}/governance/proposal/${params.proposalId}`, base)
        .href,
    [base, params.proposalId]
  );

  const {
    state: { loading: restLoading, error: restError, data: restData },
  } = useFetch<RestProposalResponse>(proposalUrl);

  const { data, loading, error } = useQuery<
    ProposalQueryResult,
    ProposalVariables
  >(PROPOSAL_QUERY, {
    fetchPolicy: 'no-cache',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
    pollInterval: 5000,
  });

  if (error || restError) {
    return (
      <Callout intent={Intent.Danger} title={t('Something went wrong')}>
        <pre>{error?.message || restError?.message}</pre>
      </Callout>
    );
  }

  if (loading || !data || restLoading || !restData) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <Proposal proposal={data.proposal} terms={restData?.data.proposal.terms} />
  );
};
