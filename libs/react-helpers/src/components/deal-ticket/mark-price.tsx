import { gql, useSubscription } from '@apollo/client';

const MARK_PRICE_SUB = gql`
  subscription MarkPrice($marketId: ID!) {
    marketData(marketId: $marketId) {
      markPrice
    }
  }
`;

interface MarkPriceProps {
  marketId: string;
}

export const MarkPrice = ({ marketId }: MarkPriceProps) => {
  const { data, loading } = useSubscription(MARK_PRICE_SUB, {
    variables: { marketId },
  });

  if (loading || !data) {
    return null;
  }

  return <span>~{data.marketData.markPrice}</span>;
};
