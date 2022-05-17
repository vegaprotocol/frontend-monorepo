import { LandingDialog } from '@vegaprotocol/market-list';
import MarketPage from './markets/[marketId].page';

export function Index() {
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in continuous mode( ie, not in auction).

  const marketId =
    '868b8865bae80bd663d6c6c78fb26b40b7047ee8daaf68d539e8f587faed4934';
  return (
    <>
      <LandingDialog />
      <MarketPage id={marketId} />
    </>
  );
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
