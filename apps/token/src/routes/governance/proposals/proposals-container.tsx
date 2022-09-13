import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { gql, useQuery } from '@apollo/client';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { PROPOSAL_FRAGMENT } from '../proposal-fragment';
import type { Proposals } from './__generated__/Proposals';
import { ProposalState } from '@vegaprotocol/types';

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

  const proposals = compact(data?.proposalsConnection?.edges)
    .map((e) => e.node)
    .filter((p) => p.state !== ProposalState.STATE_REJECTED);
  const orderedProposals = orderBy(
    proposals,
    [
      (p) => new Date(p.terms.enactmentDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
      (p) => new Date(p.terms.closingDatetime).getTime(),
      (p) => p.id,
    ],
    ['desc', 'desc', 'desc']
  );

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

  return <ProposalsList proposals={orderedProposals} />;
};
