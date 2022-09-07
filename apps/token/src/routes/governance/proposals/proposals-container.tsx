import { gql, useQuery } from '@apollo/client';
import { getNotRejectedProposals } from '@vegaprotocol/governance';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { PROPOSAL_FRAGMENT } from '../proposal-fragment';
import type { Proposals } from './__generated__/Proposals';

export const PROPOSALS_QUERY = gql`
  ${PROPOSAL_FRAGMENT}
  query Proposals {
    proposalsConnection {
      edges {
        node {
          ...ProposalFields
        }
      }
    }
  }
`;

export const ProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<Proposals>(PROPOSALS_QUERY, {
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const proposals = useMemo(() => getNotRejectedProposals(data), [data]);

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('Something went wrong')}>
        <pre>{error.message}</pre>
      </Callout>
    );
  }

  if (loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return <ProposalsList proposals={proposals} />;
};
