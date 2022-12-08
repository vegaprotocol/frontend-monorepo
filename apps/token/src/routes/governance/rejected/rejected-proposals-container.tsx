import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { RejectedProposalsList } from '../components/proposals-list';
import { getRejectedProposals } from '@vegaprotocol/governance';
import type { ProposalFieldsFragment } from '../proposals/__generated__/Proposals';
import { useProposalsQuery } from '../proposals/__generated__/Proposals';

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
