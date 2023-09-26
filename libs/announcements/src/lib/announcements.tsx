import { useEffect, useState } from 'react';
import type { AppNameType, Announcement } from './schema';
import {
  useAnnouncement,
  useDismissedAnnouncement,
} from './hooks/use-announcement';
import {
  AnnouncementBanner as Banner,
  ExternalLink,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

export type AnnouncementBannerProps = {
  app: AppNameType;
  configUrl: string;
  background?: string;
};

// run only if below the allowed maximum delay ~24.8 days (https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)
const MAX_DELAY = 2147483648;

const doesStartInTheFuture = (now: Date, data: Announcement) => {
  return data.timing?.from
    ? now < data.timing.from &&
        data.timing.from.valueOf() - now.valueOf() < MAX_DELAY
    : false;
};

const doesEndInTheFuture = (now: Date, data: Announcement) => {
  return data.timing?.to
    ? now < data.timing.to &&
        data.timing.to.valueOf() - now.valueOf() < MAX_DELAY
    : false;
};

export const AnnouncementBanner = ({
  app,
  configUrl,
  background,
}: AnnouncementBannerProps) => {
  const [isVisible, setVisible] = useState(false);
  const { data, reload } = useAnnouncement(app, configUrl);
  const [, setDismissed] = useDismissedAnnouncement();

  useEffect(() => {
    const now = new Date();
    let stampFrom: NodeJS.Timeout;
    let stampTo: NodeJS.Timeout;

    if (data) {
      const startsInTheFuture = doesStartInTheFuture(now, data);
      const endsInTheFuture = doesEndInTheFuture(now, data);

      if (!startsInTheFuture) {
        setVisible(true);
      }

      if (data.timing?.from && startsInTheFuture) {
        stampFrom = setTimeout(() => {
          setVisible(true);
        }, data.timing.from.valueOf() - now.valueOf());
      }

      if (data.timing?.to && endsInTheFuture) {
        stampTo = setTimeout(() => {
          setVisible(false);
          reload();
        }, data.timing.to.valueOf() - now.valueOf());
      }
    }

    return () => {
      clearTimeout(stampFrom);
      clearTimeout(stampTo);
    };
  }, [data, reload, setVisible]);

  if (!data || !isVisible) {
    return <div />;
  }

  return (
    <Banner className="relative px-10" background={background}>
      <div
        data-testid="app-announcement"
        className="relative flex justify-center text-lg text-center text-white font-alpha gap-2"
      >
        <span>{data.text}</span>{' '}
        {data.urlText && data.url && (
          <ExternalLink href={data.url}>{data.urlText}</ExternalLink>
        )}
      </div>
      <button
        className="absolute top-0 right-0 flex items-center justify-center w-10 h-full p-4 text-white"
        data-testid="app-announcement-close"
        onClick={() => {
          setVisible(false);
          setDismissed(data);
        }}
      >
        <VegaIcon name={VegaIconNames.CROSS} size={24} />
      </button>
    </Banner>
  );
};
