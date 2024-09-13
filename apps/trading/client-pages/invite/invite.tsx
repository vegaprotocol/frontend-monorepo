import { Loader } from '@vegaprotocol/ui-toolkit';
import { useReferralSet } from '../referrals/hooks/use-find-referral-set';
import { useEffect } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';

import { Links } from '../../lib/links';
import { StepConnect } from './step-connect';
import { useInviteStore } from './use-invite-store';
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
    </Routes>
  );
};

const ProcessSteps = () => {
  const [params] = useSearchParams();
  const code = params.get('code') || undefined;
  const team = params.get('team') || undefined;

  const {
    data: referralData,
    isEligible,
    loading: referralLoading,
  } = useReferralSet(code);
  const validReferral = Boolean(referralData && isEligible);

  const { team: teamData, loading: teamLoading } = useTeam(team);
  const validTeam = Boolean(teamData);

  const [storedCode, storedTeam, started, finished] = useInviteStore(
    (state) => [state.code, state.team, state.started, state.finished]
  );
  const [setCode, setTeam, start] = useInviteStore((state) => [
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
    // already finished
    if (finished > 0) return;
    // already started, ignoring new code, team values TODO: Check this
    if (started > 0) return;

    if (code && validReferral) setCode(code);
    if (team && validTeam) setTeam(team);
    start();
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
  ]);

  /**
   * Already finished onboarding, no need to go through the process again.
   */
  if (finished > 0) {
    return <Navigate to={Links.MARKETS()} />;
  }

  if (started <= 0 || loading) {
    return <Loader className="text-surface-0-fg" />;
  }

  if (desiredStep) {
    return <Navigate to={StepRoutes[desiredStep]} />;
  }

  return <div className="text-red">COULD NOT DETERMINE STEP</div>;
};
