import { AnnouncementBanner } from '@vegaprotocol/announcements';
import { useEnvironment } from '@vegaprotocol/environment';

export const Banner = () => {
  const { ANNOUNCEMENTS_CONFIG_URL } = useEnvironment()

  // Return an empty div so that the grid layout in _app.page.ts
  // renders correctly
  if (!ANNOUNCEMENTS_CONFIG_URL) {
    return <div />;
  }

  return (
    <AnnouncementBanner
      app="console"
      configUrl={ANNOUNCEMENTS_CONFIG_URL}
    />
  );
};
