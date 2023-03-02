import {
  AnnouncementBanner,
  ExternalLink,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useGlobalStore } from '../../stores';
import React from 'react';

export const Banner = () => {
  const { update, shouldDisplayAnnouncementBanner } = useGlobalStore(
    (store) => ({
      update: store.update,
      shouldDisplayAnnouncementBanner: store.shouldDisplayAnnouncementBanner,
    })
  );

  // Return an empty div so that the grid layout in _app.page.ts
  // renders correctly
  if (!shouldDisplayAnnouncementBanner) {
    return <div />;
  }

  return (
    <AnnouncementBanner>
      <div className="grid grid-cols-[auto_1fr] gap-4 font-alpha calt uppercase text-center text-lg text-white">
        <button
          className="flex items-center"
          onClick={() => update({ shouldDisplayAnnouncementBanner: false })}
        >
          <Icon name="cross" className="w-6 h-6" ariaLabel="dismiss" />
        </button>
        <div>
          <span className="pr-4">Mainnet sim 2 is live!</span>
          <ExternalLink href="https://fairground.wtf/">Learn more</ExternalLink>
        </div>
      </div>
    </AnnouncementBanner>
  );
};
