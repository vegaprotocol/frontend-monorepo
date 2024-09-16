import { useT } from '../../lib/use-t';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';
import { StepHeader } from './step-header';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { Navigate } from 'react-router-dom';
import { ProgressionChain } from './step-progression-chain';
import { APP_NAME } from '../../lib/constants';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { CompetitionsActions } from '../../components/competitions/competitions-cta';
import last from 'lodash/last';
import { useOnboardStore } from '../../stores/onboard';

export const StepStartPlaying = () => {
  const t = useT();
  const { role: myRole, teamId: myTeamId } = useMyTeam();

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  const [finished, finish] = useOnboardStore((state) => [
    state.finished,
    state.finish,
  ]);

  /** Marks onboarding progression as finished if this is the last step */
  const onAction = () => {
    const lastStep = last(progression);
    if (!currentStep || !lastStep) return;
    if (currentStep === lastStep && finished === 0) {
      finish();
    }
  };

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.StartPlaying) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <div className="mx-auto flex flex-col gap-10">
      <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      <ProgressionChain currentStep={currentStep} progression={progression} />
      <CompetitionsActions
        myRole={myRole}
        myTeamId={myTeamId}
        onAction={onAction}
      />
    </div>
  );
};
