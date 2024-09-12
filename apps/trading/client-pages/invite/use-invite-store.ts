import { APP_NAME } from '../../lib/constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware/persist';

type InviteStore = {
  code?: string;
  team?: string;
  finished: number;
  started: number;
};
type InviteActions = {
  start: () => void;
  finish: () => void;
  setCode: (code: string) => void;
  setTeam: (teamId: string) => void;
};

export const useInviteStore = create<InviteStore & InviteActions>()(
  persist(
    (set) => ({
      code: undefined,
      team: undefined,
      finished: 0,
      started: 0,
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
    }),
    {
      name: `${APP_NAME.toLowerCase()}-invite-store`,
      version: 1,
    }
  )
);
