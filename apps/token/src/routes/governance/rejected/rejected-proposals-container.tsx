import { useQuery } from '@apollo/client';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import compact from 'lodash/compact';
import filter from 'lodash/filter';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PROPOSALS_QUERY } from '../proposals';

import { SplashLoader } from '../../../components/splash-loader';
import { RejectedProposalsList } from '../components/proposals-list';
import type { Proposals } from '../proposals/__generated__/Proposals';

export const RejectedProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<Proposals, never>(PROPOSALS_QUERY, {
    pollInterval: 5000,
    errorPolicy: 'ignore', // this is to get around some backend issues and should be removed in future
  });

  const proposals = React.useMemo(() => {
    if (!data?.proposals?.length) {
      return [];
    }

    return flow([
      compact,
      (arr) => filter(arr, ({ state }) => state === 'Rejected'),
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

  return <RejectedProposalsList proposals={proposals} />;
};
