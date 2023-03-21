import { useEffect, useState } from 'react';
import type { AppNameType } from './schema';
import { useAnnouncement } from './hooks/use-announcement';
import {
  AnnouncementBanner as Banner,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';

export type AnnouncementBannerProps = {
  app: AppNameType;
  configUrl: string;
};

// run only if below the allowed maximum delay ~24.8 days (https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)
const MAX_DELAY = 2147483648

export const AnnouncementBanner = ({
  app,
  configUrl,
}: AnnouncementBannerProps) => {
  const [isVisible, setVisible] = useState(false);
  const { data } = useAnnouncement(app, configUrl);

  useEffect(() => {
    const now = new Date();
    let stampFrom: NodeJS.Timeout;
    let stampTo: NodeJS.Timeout;

    if (data) {
      if (!data.timing || (data.timing?.from && now > data.timing.from)) {
        setVisible(true);
      } else if (data.timing.from && now < data.timing.from && (data.timing.from.valueOf() - now.valueOf()) < MAX_DELAY) {
        stampFrom = setTimeout(() => {
          setVisible(true);
        }, data.timing.from.valueOf() - now.valueOf());
      }

      if (data.timing?.to && now < data.timing.to && data.timing.to.valueOf() - now.valueOf() < MAX_DELAY) {
        stampTo = setTimeout(() => {
          setVisible(false);
        }, data.timing.to.valueOf() - now.valueOf());
      }
    }

    return () => {
      clearTimeout(stampFrom);
      clearTimeout(stampTo);
    };
  }, [data, setVisible]);

  if (!data || !isVisible) {
    return null;
  }

  return (
    <Banner>
      <div
        data-testid="app-announcement"
        className="font-alpha flex gap-2 justify-center calt uppercase text-center text-lg text-white"
      >
        <span className="pr-4">{data.text}</span>
        {data.urlText && data.url && (
          <ExternalLink href={data.url}>{data.urlText}</ExternalLink>
        )}
      </div>
    </Banner>
  );
};
