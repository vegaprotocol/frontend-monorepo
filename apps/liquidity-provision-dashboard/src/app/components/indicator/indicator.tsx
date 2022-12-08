import * as Schema from '@vegaprotocol/types';

import { getColorForStatus } from '../../lib/utils';

export const Indicator = ({
  status,
  opacity,
}: {
  status?: Schema.MarketTradingMode;
  opacity?: number;
}) => {
  const backgroundColor = status ? getColorForStatus(status) : undefined;
  return (
    <div className="inline-block w-2 h-2 mr-1 rounded-full bg-white overflow-hidden shrink-0">
      <div
        className="h-full bg-black"
        style={{
          opacity,
          backgroundColor,
        }}
      />
    </div>
  );
};
