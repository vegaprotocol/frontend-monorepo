import { Card } from '../../components/card';
import { APP_NAME } from '../../lib/constants';
import { ns, useT } from '../../lib/use-t';
import { Button, Intent, Loader, VLogo } from '@vegaprotocol/ui-toolkit';
import { useDialogStore } from '@vegaprotocol/wallet-react';
import { Trans } from 'react-i18next';
import { useReferralSet } from '../referrals/hooks/use-find-referral-set';
import { type ReactNode } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { Navigate } from 'react-router-dom';
import { usePartyProfilesQuery } from 'apps/trading/components/vega-wallet-connect-button/__generated__/PartyProfiles';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { StepHeader } from './step-header';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
  useInviteStore,
} from './invite';

export const StepConnect = () => {
  const t = useT();
  const openWalletDialog = useDialogStore((state) => state.open);

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading: stepLoading } =
    useDetermineCurrentStep(progression);

  const [code, team] = useInviteStore((state) => [state.code, state.team]);
  const { data: referralData, loading: referralLoading } = useReferralSet(code);

  const { data: profileData, loading: profileLoading } = usePartyProfilesQuery({
    variables: {
      partyIds: referralData?.referrer ? [referralData.referrer] : [],
    },
    skip: !referralData?.referrer,
  });
  const referrerProfile = removePaginationWrapper(
    profileData?.partiesProfilesConnection?.edges
  ).find((p) => p.partyId === referralData?.referrer);

  const { team: teamData, loading: teamLoading } = useTeam(team);

  let invitedBy = referrerProfile?.alias || '';
  if (teamData && teamData.name.length > 0) {
    invitedBy = teamData.name;
  }

  // eslint-disable-next-line no-console
  console.log('invite', profileData);

  let header: ReactNode = t('ONBOARDING_INVITE_HEADER', {
    appName: APP_NAME,
  });
  if (invitedBy.length > 0) {
    header = (
      <Trans
        i18nKey={'ONBOARDING_INVITE_BY_HEADER'}
        ns={ns}
        components={[
          <span key="invited-by-name" className="text-surface-0-fg">
            {invitedBy}
          </span>,
        ]}
        values={{
          appName: APP_NAME,
          name: invitedBy,
        }}
      />
    );
  }

  const loading =
    stepLoading || referralLoading || profileLoading || teamLoading;

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.Connect) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <StepHeader title={header} />
        <Card className="p-8 flex flex-col gap-4 items-center">
          {/** TODO: Change logo */}
          <VLogo />
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { appName: APP_NAME })}
          </h3>
          <p>
            {t('ONBOARDING_STEP_CONNECT_DESCRIPTION', {
              appName: APP_NAME,
            })}
          </p>
          <Button intent={Intent.Primary} size="lg" onClick={openWalletDialog}>
            {t('Connect wallet')}
          </Button>
        </Card>
      </div>
    </>
  );
};
