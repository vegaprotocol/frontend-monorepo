import { LiquidityContainer } from '@vegaprotocol/liquidity';
import { useRouter } from 'next/router';

const LiquidityPage = ({ id }: { id?: string }) => {
  const { query } = useRouter();

  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);
  if (marketId)
    return (
      <div className="h-full grid grid-rows-[min-content_1fr]">
        <LiquidityContainer marketId={marketId} />
      </div>
    );
  return null;
};
LiquidityPage.getInitialProps = () => ({
  page: 'liquidity',
});

export default LiquidityPage;
