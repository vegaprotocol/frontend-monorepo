import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import compact from 'lodash/compact';
import filter from 'lodash/filter';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { RejectedProposalsList } from '../components/proposals-list';
import { getProposals, useProposalsQuery } from '@vegaprotocol/governance';
import { ProposalState } from '@vegaprotocol/types';

export const RejectedProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery(true);

  const proposals = React.useMemo(() => {
    const proposalsData = getProposals(data);
    if (!proposalsData.length) {
      return [];
    }

    return flow([
      compact,
      (arr) =>
        filter(arr, ({ state }) => state === ProposalState.STATE_REJECTED),
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
    ])(data);
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
