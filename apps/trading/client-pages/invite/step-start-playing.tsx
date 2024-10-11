import { useT } from '../../lib/use-t';
import { StepHeader } from './step-header';
import { Button, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../lib/constants';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { CompetitionsActions } from '../../components/competitions/competitions-cta';
import { useOnboardStore } from '../../stores/onboard';
import { Links } from '../../lib/links';
import { ProgressionChain } from './step-progression-chain';

export const StepStartPlaying = () => {
  const t = useT();
  const {
    role: myRole,
    teamId: myTeamId,
    loading: myTeamLoading,
  } = useMyTeam();

  const finish = useOnboardStore((s) => s.finish);
  const step = useOnboardStore((s) => s.step);
  const steps = useOnboardStore((s) => s.steps);

  // Marks onboarding progression as finished as this step is always last
  const onAction = () => {
    finish();
  };

  if (myTeamLoading) {
    return <Loader className="text-surface-0-fg" />;
  }

  return (
    <div className="mx-auto flex flex-col gap-10">
      <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      <ProgressionChain currentStep={step} progression={steps} />
      <p className="text-center">
        {t('ONBOARDING_STEP_START_PLAYING_DESCRIPTION')}
      </p>
      <CompetitionsActions
        myRole={myRole}
        myTeamId={myTeamId}
        onAction={onAction}
      />
      <p className="text-center text-surface-0-fg-muted flex flex-col items-center gap-4">
        <span>{t('ONBOARDING_STEP_START_PLAYING_DISMISS_MESSAGE')}</span>
        <DismissButton />
      </p>
    </div>
  );
};

const DismissButton = () => {
  const t = useT();
  const finish = useOnboardStore((s) => s.finish);
  return (
    <Link
      key="dismiss-invitation"
      to={Links.MARKETS()}
      onClick={() => {
        finish();
      }}
    >
      <Button intent={Intent.Primary}>{t('Go to markets')}</Button>
    </Link>
  );
};
