import React from 'react';
import { MarketNameCell } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketProvider, useSuccessorMarketIds } from '@vegaprotocol/markets';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';

export const SuccessorMarketRenderer = ({
  value,
  parent,
}: {
  value: string;
  parent?: boolean;
}) => {
  const successors = useSuccessorMarketIds(value);
  const onMarketClick = useMarketClickHandler();

  const lookupValue = successors
    ? parent
      ? successors.parentMarketID
      : successors.successorMarketID
    : '';

  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables: {
      marketId: lookupValue || '',
    },
    skip: !lookupValue,
  });

  return data ? (
    <MarketNameCell
      value={data.tradableInstrument.instrument.code}
      data={data}
      onMarketClick={onMarketClick}
      productType={data.tradableInstrument.instrument?.product.__typename ?? ''}
    />
  ) : (
    '-'
  );
};
