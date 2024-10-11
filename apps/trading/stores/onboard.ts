import { APP_NAME } from '../lib/constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Step {
  Connect = 'Connect',
  Deposit = 'Deposit',
  ApplyCode = 'ApplyCode',
  JoinTeam = 'JoinTeam',
  StartPlaying = 'StartPlaying',
}

export const StepProgressions = {
  /**
   * The default onboarding progression, no special invitation given.
   */
  Default: [Step.Deposit, Step.StartPlaying],

  /**
   * The onboarding progression when landed with a referral code.
   */
  Referral: [Step.Deposit, Step.ApplyCode, Step.StartPlaying],

  /**
   * The onboarding progression when landed with a team invitation.
   */
  TeamInvitation: [
    Step.Deposit,
    Step.JoinTeam /** goes to team after joining successfully */,
  ],

  /**
   * The onboarding progression when landed with both referral code
   * and team invitation.
   */
  ReferralAndTeamInvitation: [Step.Deposit, Step.ApplyCode, Step.JoinTeam],
};

type InviteStore = {
  finished: number;
  started: number;
  dismissed: boolean;
  step: number;
  steps: Step[];
  code?: string;
  team?: string;
};

type InviteActions = {
  next: () => void;
  finish: () => void;
  init: (params: { code?: string; team?: string }) => void;
  dismiss: () => void;
};

export const determineStepProgression = (code?: string, team?: string) => {
  if (code && !team) return 'Referral';
  if (!code && team) return 'TeamInvitation';
  if (code && team) return 'ReferralAndTeamInvitation';
  return 'Default';
};

export const useOnboardStore = create<InviteStore & InviteActions>()(
  persist(
    (set) => ({
      code: undefined,
      team: undefined,
      step: 0,
      steps: [],
      finished: 0,
      started: 0,
      dismissed: false,
      init: (params) => {
        set({
          code: params.code,
          team: params.team,
          started: Date.now(),
          steps:
            StepProgressions[
              determineStepProgression(params.code, params.team)
            ],
        });
      },
      next: () => {
        set((state) => {
          if (state.step < state.steps.length - 1) {
            return { step: state.step + 1 };
          }
          return state;
        });
      },
      finish: () => {
        set({ finished: Date.now() });
      },
      dismiss: () => {
        set({ dismissed: true });
      },
    }),
    {
      name: `${APP_NAME.toLowerCase()}_invite_store`,
      version: 1,
    }
  )
);
