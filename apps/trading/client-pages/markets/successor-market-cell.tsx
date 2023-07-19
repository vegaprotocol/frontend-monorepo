import { MarketNameCell } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketProvider } from '@vegaprotocol/markets';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import React from 'react';

export const SuccessorMarketRenderer = ({ value }: { value: string }) => {
  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables: {
      marketId: value || '',
    },
    skip: !value,
  });
  const onMarketClick = useMarketClickHandler();
  return data ? (
    <MarketNameCell
      value={data.tradableInstrument.instrument.code}
      data={data}
      onMarketClick={onMarketClick}
    />
  ) : (
    ' - '
  );
};
