import { AnnouncementBanner as Banner } from '@vegaprotocol/announcements';
import { useEnvironment } from '@vegaprotocol/environment';

export const AnnouncementBanner = () => {
  const { ANNOUNCEMENTS_CONFIG_URL } = useEnvironment();
  // Return an empty div so that the grid layout in _app.page.ts
  // renders correctly
  if (!ANNOUNCEMENTS_CONFIG_URL) {
    return null;
  }

  return <Banner app="console" configUrl={ANNOUNCEMENTS_CONFIG_URL} />;
};
