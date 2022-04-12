import { MarketsContainer } from '@vegaprotocol/market-list';

const Markets = () => {
  return <MarketsContainer />;
};

Markets.getInitialProps = () => ({
  page: 'markets',
});

export default Markets;
