import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const LazyLiquidityPage = dynamic(
  () => import('../../client-pages/liquidity'),
  { ssr: false }
);

const LiquidityPage = () => {
  const { query } = useRouter();

  // Default to first marketId query item if found
  const marketId = Array.isArray(query.marketId)
    ? query.marketId[0]
    : query.marketId;

  if (!marketId) {
    return <div>Not found</div>;
  }

  return <LazyLiquidityPage marketId={marketId} />;
};

LiquidityPage.getInitialProps = () => ({
  page: 'liquidity',
});

export default LiquidityPage;
