import { useMarketInfoQuery } from '@vegaprotocol/markets';

export const MarketName = ({ marketId }: { marketId?: string }) => {
  const { data } = useMarketInfoQuery({
    variables: {
      marketId: marketId || '',
    },
    skip: !marketId,
  });

  return (
    <span>{data?.market?.tradableInstrument.instrument.code || marketId}</span>
  );
};
