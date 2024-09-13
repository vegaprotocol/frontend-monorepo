import { APP_NAME } from '../lib/constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type InviteStore = {
  code?: string;
  team?: string;
  finished: number;
  started: number;
  dismissed: boolean;
};
type InviteActions = {
  start: () => void;
  finish: () => void;
  setCode: (code: string) => void;
  setTeam: (teamId: string) => void;
  dismiss: () => void;
};

export const useOnboardStore = create<InviteStore & InviteActions>()(
  persist(
    (set) => ({
      code: undefined,
      team: undefined,
      finished: 0,
      started: 0,
      dismissed: false,
      start: () => {
        set({ started: Date.now(), finished: 0 });
      },
      finish: () => {
        set({ finished: Date.now() });
      },
      setCode: (code) => {
        set({ code });
      },
      setTeam: (teamId) => {
        set({ team: teamId });
      },
      dismiss: () => {
        set({ dismissed: true });
      },
    }),
    {
      name: `${APP_NAME.toLowerCase()}-invite-store`,
      version: 1,
      partialize: ({ dismissed, ...state }) => {
        // Dont store the dismissed state so that the user
        // is reminded to onboard at the start of every session
        return state;
      },
    }
  )
);
