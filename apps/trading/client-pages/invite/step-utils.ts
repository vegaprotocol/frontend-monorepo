import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOnboardStore } from '../../stores/onboard';
import { useFundsAvailable } from '../referrals/hooks/use-funds-available';
import { useFindReferralSet } from '../referrals/hooks/use-find-referral-set';
import { useMyTeam } from '../../lib/hooks/use-my-team';

export enum Step {
  Connect = 'Connect',
  Deposit = 'Deposit',
  ApplyCode = 'ApplyCode',
  JoinTeam = 'JoinTeam',
  StartPlaying = 'StartPlaying',
}

export const StepRoutes = {
  [Step.Connect]: 'connect',
  [Step.Deposit]: 'deposit',
  [Step.ApplyCode]: 'apply-code',
  [Step.JoinTeam]: 'join-team',
  [Step.StartPlaying]: 'start-playing',
};

export const StepLinks = {
  [Step.Connect]: '/invite/connect',
  [Step.Deposit]: '/invite/deposit',
  [Step.ApplyCode]: '/invite/apply-code',
  [Step.JoinTeam]: '/invite/join-team',
  [Step.StartPlaying]: '/invite/start-playing',
};

export const StepProgressions = {
  /**
   * The default onboarding progression, no special invitation given.
   */
  Default: [Step.Connect, Step.Deposit, Step.StartPlaying],

  /**
   * The onboarding progression when landed with a referral code.
   */
  Referral: [Step.Connect, Step.Deposit, Step.ApplyCode, Step.StartPlaying],

  /**
   * The onboarding progression when landed with a team invitation.
   */
  TeamInvitation: [
    Step.Connect,
    Step.Deposit,
    Step.JoinTeam /** goes to team after joining successfully */,
  ],

  /**
   * The onboarding progression when landed with both referral code
   * and team invitation.
   */
  ReferralAndTeamInvitation: [
    Step.Connect,
    Step.Deposit,
    Step.ApplyCode,
    Step.JoinTeam,
  ],
};

export const determineStepProgression = (code?: string, team?: string) => {
  if (code && !team) return StepProgressions.Referral;
  if (!code && team) return StepProgressions.TeamInvitation;
  if (code && team) return StepProgressions.ReferralAndTeamInvitation;
  return StepProgressions.Default;
};
export const useDetermineStepProgression = () => {
  const [code, team] = useOnboardStore((state) => [state.code, state.team]);
  return determineStepProgression(code, team);
};

export const useDetermineCurrentStep = (
  steps: Step[] = StepProgressions.Default
) => {
  const { pubKey, status, isReadOnly } = useVegaWallet();
  const {
    requiredFunds,
    isEligible,
    loading: fundsLoading,
  } = useFundsAvailable(pubKey, true);
  const { data: referralSet, loading: referralLoading } =
    useFindReferralSet(pubKey);
  const { team, loading: teamLoading } = useMyTeam();

  const loading = fundsLoading || referralLoading || teamLoading;
  const connected = pubKey && status === 'connected' && !isReadOnly;

  let step = undefined;

  if (!loading) {
    if (steps.includes(Step.Connect) && !connected) {
      step = Step.Connect;
    } else if (steps.includes(Step.Deposit) && requiredFunds && !isEligible) {
      step = Step.Deposit;
    } else if (steps.includes(Step.ApplyCode) && !referralSet) {
      step = Step.ApplyCode;
    } else if (steps.includes(Step.JoinTeam) && !team) {
      step = Step.JoinTeam;
    } else if (steps.includes(Step.StartPlaying)) {
      step = Step.StartPlaying;
    }
  }

  return {
    step,
    loading,
  };
};
