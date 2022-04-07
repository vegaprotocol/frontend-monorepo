import "./app-banner.scss";

import { useAppState } from "../../contexts/app-state/app-state-context";
import { Error } from "../icons";

export const AppBanner = () => {
  const {
    appState: { bannerMessage },
  } = useAppState();

  // Return empty div so that grid placement remains correct
  if (!bannerMessage) return <div />;

  return (
    <div className="app-banner" role="alert">
      <p>
        <span className="app-banner__icon">
          <Error />
        </span>
        {bannerMessage}
      </p>
    </div>
  );
};
