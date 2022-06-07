import { MarketsContainer } from '@vegaprotocol/market-list';

const Markets = () => <MarketsContainer />;

Markets.getInitialProps = () => ({
  page: 'markets',
});

export default Markets;
