import { create } from 'zustand';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { useToasts, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { subscribeWithSelector } from 'zustand/middleware';
import assert from 'assert';

type DownloadSettings = {
  title: string;
  link: string;
  filename?: string;
  isDownloaded?: boolean;
  isChanged?: boolean;
  isError?: boolean;
  isDelayed?: boolean;
  intent?: Intent;
  blob?: Blob;
};

export type LedgerDownloadFileStore = {
  queue: DownloadSettings[];
  hasItem: (link: string) => boolean;
  removeItem: (link: string) => void;
  updateQueue: (item: DownloadSettings) => void;
};

export const useLedgerDownloadFile = create<LedgerDownloadFileStore>()(
  subscribeWithSelector((set, get) => ({
    queue: [],
    hasItem: (link: string) =>
      get().queue.findIndex((item) => item.link === link) > -1,
    removeItem: (link: string) => {
      const queue = get().queue;
      const index = queue.findIndex((item) => item.link === link);
      if (index > -1) {
        queue.splice(index, 1);
        set({ queue: [...queue] });
      }
    },
    updateQueue(newitem: DownloadSettings) {
      const queue = get().queue;
      const index = queue.findIndex((item) => item.link === newitem.link);
      if (index > -1) {
        queue[index] = { ...queue[index], ...newitem };
        set({ queue: [...queue] });
      } else {
        set({ queue: [newitem, ...queue] });
      }
    },
  }))
);

const ErrorContent = () => (
  <>
    <h4 className="mb-1 text-sm">{t('Something went wrong')}</h4>
    <p>{t('Try again later')}</p>
  </>
);

const InfoContent = ({ progress = false }) => (
  <>
    <h4 className="mb-1 text-sm">
      {progress ? t('Still in progress') : t('Download has been started')}
    </h4>
    <p>{t('Please note this can take several minutes.')}</p>
    <p>{t('You will be noticed here when file will be ready.')}</p>
  </>
);

export const useLedgerDownloadManager = () => {
  const queue = useLedgerDownloadFile((store) => store.queue);
  const updateQueue = useLedgerDownloadFile((store) => store.updateQueue);
  const removeItem = useLedgerDownloadFile((store) => store.removeItem);
  const [setToast, updateToast, hasToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.update,
    store.hasToast,
    store.remove,
  ]);

  const onDownloadClose = useCallback(
    (id: string) => {
      removeToast(id);
      removeItem(id);
    },
    [removeToast, removeItem]
  );

  const createToast = (item: DownloadSettings) => {
    let content: ReactNode;
    switch (true) {
      case item.isError:
        content = <ErrorContent />;
        break;
      case Boolean(item.blob):
        content = (
          <>
            <h4 className="mb-1 text-sm">{t('File is ready')}</h4>
            <a
              onClick={() => onDownloadClose(item.link)}
              href={URL.createObjectURL(item.blob as Blob)}
              download={item.filename}
              className="underline"
            >
              {t('Get file here')}
            </a>
          </>
        );
        break;
      default:
        content = <InfoContent progress={item.isDelayed} />;
    }
    const toast: Toast = {
      id: item.link,
      intent: item.intent || Intent.Primary,
      content: (
        <>
          <h3 className="mb-1 text-md uppercase">{item.title}</h3>
          {content}
        </>
      ),
      onClose: () => onDownloadClose(item.link),
      loader: !item.isDownloaded,
    };
    if (hasToast(toast.id)) {
      updateToast(toast.id, toast);
    } else {
      setToast(toast);
    }
  };

  useEffect(() => {
    queue.forEach((item) => {
      if (item.isChanged) {
        createToast(item);
        updateQueue({ ...item, isChanged: false });
      }
    });
  }, [queue, createToast, updateQueue]);
};
