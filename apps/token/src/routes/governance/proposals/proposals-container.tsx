import { gql, useQuery } from '@apollo/client';
import { ProposalState } from '@vegaprotocol/types';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import compact from 'lodash/compact';
import filter from 'lodash/filter';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { PROPOSALS_FRAGMENT } from '../proposal-fragment';
import type { Proposals } from './__generated__/Proposals';

export const PROPOSALS_QUERY = gql`
  ${PROPOSALS_FRAGMENT}
  query Proposals {
    proposals {
      ...ProposalFields
    }
  }
`;

export const ProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<Proposals, never>(PROPOSALS_QUERY, {
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore', // this is to get around some backend issues and should be removed in future
  });

  const proposals = React.useMemo(() => {
    if (!data?.proposals?.length) {
      return [];
    }

    return flow([
      compact,
      (arr) =>
        filter(arr, ({ state }) => state !== ProposalState.STATE_REJECTED),
      (arr) =>
        orderBy(
          arr,
          [
            (p) => new Date(p.terms.enactmentDatetime).getTime(),
            (p) => new Date(p.terms.closingDatetime).getTime(),
            (p) => p.id,
          ],
          ['desc', 'desc', 'desc']
        ),
    ])(data.proposals);
  }, [data]);

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
