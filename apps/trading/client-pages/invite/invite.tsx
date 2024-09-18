import { Loader } from '@vegaprotocol/ui-toolkit';
import { useReferralSet } from '../referrals/hooks/use-find-referral-set';
import { useEffect } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';

import { StepConnect } from './step-connect';
import { useOnboardStore } from '../../stores/onboard';
import {
  determineStepProgression,
  Step,
  StepRoutes,
  useDetermineCurrentStep,
} from './step-utils';
import { StepDeposit } from './step-deposit';
import { StepApplyCode } from './step-apply-code';
import { StepJoinTeam } from './step-join-team';
import { StepStartPlaying } from './step-start-playing';
import { ExitInvite } from './exit-invite';

export const Invite = () => {
  return (
    <Routes>
      <Route path="" element={<ProcessSteps />} />
      <Route path={StepRoutes[Step.Connect]} element={<StepConnect />} />
      <Route path={StepRoutes[Step.Deposit]} element={<StepDeposit />} />
      <Route path={StepRoutes[Step.ApplyCode]} element={<StepApplyCode />} />
      <Route path={StepRoutes[Step.JoinTeam]} element={<StepJoinTeam />} />
      <Route
        path={StepRoutes[Step.StartPlaying]}
        element={<StepStartPlaying />}
      />
      <Route path="*" element={<Navigate to={''} />} />
    </Routes>
  );
};

const ProcessSteps = () => {
  const [params] = useSearchParams();
  const code = params.get('code') || undefined;
  const team = params.get('team') || undefined;

  const { data: referralData, loading: referralLoading } = useReferralSet(code);
  const validReferral = Boolean(referralData);

  const { team: teamData, loading: teamLoading } = useTeam(team);
  const validTeam = Boolean(teamData);

  const [storedCode, storedTeam, started, finished] = useOnboardStore(
    (state) => [state.code, state.team, state.started, state.finished]
  );
  const [setCode, setTeam, start] = useOnboardStore((state) => [
    state.setCode,
    state.setTeam,
    state.start,
  ]);

  const progression = determineStepProgression(storedCode, storedTeam);
  const { step: desiredStep, loading: stepLoading } =
    useDetermineCurrentStep(progression);

  const loading = referralLoading || teamLoading || stepLoading;

  useEffect(() => {
    if (loading) return;

    const hasNewCode = code && validReferral && code !== storedCode;
    const hasNewTeam = team && validTeam && team !== storedTeam;

    // if finished but landed here with a new code then start onboarding again
    if (finished > 0 && !hasNewCode && !hasNewTeam) return;

    if (hasNewCode) {
      setCode(code);
    }
    if (hasNewTeam) {
      setTeam(team);
    }

    if (started === 0) start();
  }, [
    code,
    finished,
    loading,
    setCode,
    setTeam,
    start,
    started,
    storedCode,
    storedTeam,
    team,
    validReferral,
    validTeam,
  ]);

  /**
   * Already finished onboarding, no need to go through the process again.
   */
  if (finished > 0) {
    return <ExitInvite />;
  }

  if (started <= 0 || loading) {
    return <Loader className="text-surface-0-fg" />;
  }

  if (desiredStep) {
    return <Navigate to={StepRoutes[desiredStep]} />;
  }

  return <ExitInvite />;
};
