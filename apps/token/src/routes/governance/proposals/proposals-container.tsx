import { getProposals, useProposalsQuery } from '@vegaprotocol/governance';
import type { Proposal_proposal } from '@vegaprotocol/governance';
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

export const ProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery(true);

  const proposals = React.useMemo(() => {
    const proposalsData = getProposals(data);
    if (!proposalsData.length) {
      return [];
    }

    return flow([
      compact,
      (arr: Proposal_proposal[]) =>
        filter(arr, ({ state }) => state !== ProposalState.STATE_REJECTED),
      (arr: Proposal_proposal[]) =>
        orderBy(
          arr,
          [
            (p) => new Date(p.terms.enactmentDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
            (p) => new Date(p.terms.closingDatetime).getTime(),
            (p) => p.id,
          ],
          ['desc', 'desc', 'desc']
        ),
    ])(proposalsData);
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
