import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { RejectedProposalsList } from '../components/proposals-list';
import type { ProposalFieldsFragment } from '../proposals/__generated__/Proposals';
import { useProposalsQuery } from '../proposals/__generated__/Proposals';
import type { NodeConnection, NodeEdge } from '@vegaprotocol/utils';
import { getNodes } from '@vegaprotocol/utils';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import { ProposalState } from '@vegaprotocol/types';

const orderByDate = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.closingDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
      (p) => p.id,
    ],
    ['desc', 'desc']
  );

export function getRejectedProposals<T extends ProposalFieldsFragment>(
  data?: NodeConnection<NodeEdge<ProposalFieldsFragment>> | null
): T[] {
  return flow([
    (data) =>
      getNodes<ProposalFieldsFragment>(data, (p) =>
        p ? p?.state === ProposalState.STATE_REJECTED : false
      ),
    orderByDate,
  ])(data);
}

export const RejectedProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery();

  const proposals = useMemo(
    () =>
      getRejectedProposals<ProposalFieldsFragment>(data?.proposalsConnection),
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

  return <RejectedProposalsList proposals={proposals} />;
};
