import compact from 'lodash/compact';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { RejectedProposalsList } from '../components/proposals-list';
import { type ProposalFieldsFragment } from '../__generated__/Proposals';
import { useProposalsQuery } from '../__generated__/Proposals';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import { ProposalState } from '@vegaprotocol/types';
import { type BatchProposal, type Proposal } from '../types';

const orderByDate = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.closingDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered
      (p) => p.id,
    ],
    ['desc', 'desc']
  );

export function getRejectedProposals(
  data?: Array<Proposal | BatchProposal> | null
) {
  return flow([
    (data) =>
      data.filter(
        (p: ProposalFieldsFragment) => p?.state === ProposalState.STATE_REJECTED
      ),
    orderByDate,
  ])(data);
}

export const RejectedProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const proposals = useMemo(
    () =>
      getRejectedProposals(
        compact(data?.proposalsConnection?.edges?.map((e) => e?.proposalNode))
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

  return <RejectedProposalsList proposals={proposals} />;
};
