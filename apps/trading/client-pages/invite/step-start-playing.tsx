import { ns, useT } from '../../lib/use-t';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';
import { StepHeader } from './step-header';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { Link, Navigate } from 'react-router-dom';
import { ProgressionChain } from './step-progression-chain';
import { APP_NAME } from '../../lib/constants';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { CompetitionsActions } from '../../components/competitions/competitions-cta';
import last from 'lodash/last';
import { useOnboardStore } from '../../stores/onboard';
import { ExitInvite } from './exit-invite';
import { Links } from '../../lib/links';
import { Trans } from 'react-i18next';

export const StepStartPlaying = () => {
  const t = useT();
  const {
    role: myRole,
    teamId: myTeamId,
    loading: myTeamLoading,
  } = useMyTeam();

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  const store = useOnboardStore();

  /** Marks onboarding progression as finished if this is the last step */
  const onAction = () => {
    const lastStep = last(progression);
    if (!currentStep || !lastStep) return;
    if (currentStep === lastStep && store.finished === 0) {
      store.finish();
    }
  };

  if (loading || myTeamLoading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <ExitInvite />;
  if (currentStep !== Step.StartPlaying) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <div className="mx-auto flex flex-col gap-10">
      <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      <ProgressionChain currentStep={currentStep} progression={progression} />
      <p className="text-center">
        {t('ONBOARDING_STEP_START_PLAYING_DESCRIPTION')}
      </p>
      <CompetitionsActions
        myRole={myRole}
        myTeamId={myTeamId}
        onAction={onAction}
      />
      <div className="text-center text-surface-0-fg-muted text-sm">
        <Trans
          i18nKey="ONBOARDING_STEP_START_PLAYING_DISMISS_MESSAGE"
          ns={ns}
          components={[
            <Link
              key="dismiss-invitation"
              to={Links.MARKETS()}
              onClick={() => {
                store.finish();
              }}
              className="underline"
            >
              Dismiss and go to all markets
            </Link>,
          ]}
        />
      </div>
    </div>
  );
};
