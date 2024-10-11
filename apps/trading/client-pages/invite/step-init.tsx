import { Navigate, useSearchParams } from 'react-router-dom';

import { Step, useOnboardStore } from '../../stores/onboard';

import { StepRoutes } from './step-utils';
import { useEffect } from 'react';
import { useReferralSet } from '../referrals/hooks/use-find-referral-set';
import { useTeam } from 'apps/trading/lib/hooks/use-team';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

/** Initilizaes the onboarding store and navigates to the required step */
export const StepInit = () => {
  const [params] = useSearchParams();
  const code = params.get('code') || undefined;
  const team = params.get('team') || undefined;

  const { status, isReadOnly } = useVegaWallet();

  const init = useOnboardStore((s) => s.init);
  const step = useOnboardStore((s) => s.step);
  const steps = useOnboardStore((s) => s.steps);
  const started = useOnboardStore((s) => s.started);

  // Fetch set/team to ensure that the provide code/team are valid
  const { data: referralData, loading: referralLoading } = useReferralSet(code);
  const { team: teamData, loading: teamLoading } = useTeam(team);
  const validCode = referralData ? code : undefined;
  const validTeam = teamData ? team : undefined;
  const loading = referralLoading || teamLoading;

  // Initialize the onboarding store with a code or team id
  // from search params
  useEffect(() => {
    if (loading) return;

    init({
      code: validCode,
      team: validTeam,
    });
  }, [init, loading, validCode, validTeam]);

  if (loading || started === 0) {
    return <Loader />;
  }

  // Already connected go to the first step
  if (status === 'connected' && !isReadOnly) {
    return <Navigate to={StepRoutes[steps[step]]} />;
  }

  // not connected go to connect
  return <Navigate to={StepRoutes[Step.Connect]} />;
};
