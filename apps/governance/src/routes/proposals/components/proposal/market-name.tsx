import { useMarketInfoQuery } from '@vegaprotocol/markets';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

export const MarketName = ({
  marketId,
  truncate,
}: {
  marketId?: string;
  truncate?: boolean;
}) => {
  const { data } = useMarketInfoQuery({
    variables: {
      marketId: marketId || '',
    },
    skip: !marketId,
  });

  const id = truncate ? truncateMiddle(marketId || '') : marketId;

  return <span>{data?.market?.tradableInstrument.instrument.code || id}</span>;
};
