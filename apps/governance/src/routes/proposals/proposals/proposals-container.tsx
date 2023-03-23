import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { useProposalsQuery } from './__generated__/Proposals';
import type { ProposalFieldsFragment } from './__generated__/Proposals';
import type { NodeConnection, NodeEdge } from '@vegaprotocol/utils';
import { getNodes } from '@vegaprotocol/utils';
import flow from 'lodash/flow';
import { ProposalState } from '@vegaprotocol/types';

import orderBy from 'lodash/orderBy';

const orderByDate = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [(p) => new Date(p?.terms?.closingDatetime).getTime(), (p) => p.id],
    ['desc', 'desc']
  );

export function getNotRejectedProposals<T extends ProposalFieldsFragment>(
  data?: NodeConnection<NodeEdge<T>> | null
): T[] {
  return flow([
    (data) =>
      getNodes<ProposalFieldsFragment>(data, (p) =>
        p ? p.state !== ProposalState.STATE_REJECTED : false
      ),
    orderByDate,
  ])(data);
}

export const ProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const proposals = useMemo(
    () =>
      getNotRejectedProposals<ProposalFieldsFragment>(
        data?.proposalsConnection
      ),
    [data]
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

  return <ProposalsList proposals={proposals} />;
};
