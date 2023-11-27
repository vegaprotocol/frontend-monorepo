import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { useNavigateToLastMarket } from '../../lib/hooks/use-navigate-to-last-market';

// The home pages only purpose is to redirect to the users last market,
// the top traded if they are new, or fall back to the list of markets.
// Thats why we just render a loader here
export const Home = () => {
  useNavigateToLastMarket();

  return (
    <Splash>
      <Loader />
    </Splash>
  );
};
