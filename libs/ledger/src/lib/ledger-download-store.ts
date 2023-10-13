import { create } from 'zustand';

type DownloadSettings = {
  link: string;
  isFetched: boolean;
  isDownloaded: boolean;
  isReceived: boolean;
};

export type LedgerDownloadFileStore = DownloadSettings & {
  reset: () => void;
  update: (arg: Partial<DownloadSettings>) => void;
};

export const useLedgerDownloadFile = create<LedgerDownloadFileStore>()(
  (set) => ({
    link: '',
    isFetched: false,
    isDownloaded: false,
    isReceived: false,
    reset: () => {
      set({
        link: '',
        isFetched: false,
        isDownloaded: false,
        isReceived: false,
      });
    },
    update: (args: Partial<DownloadSettings>) => {
      set(args);
    },
  })
);
