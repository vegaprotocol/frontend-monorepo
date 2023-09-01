import { useFundingPeriodsQuery } from '@vegaprotocol/markets';

export const FundingContainer = ({ marketId }: { marketId: string }) => {
  const { data } = useFundingPeriodsQuery({
    variables: { marketId: marketId || '' },
    skip: !marketId,
  });
  return <pre>{JSON.stringify(data)}</pre>;
};
