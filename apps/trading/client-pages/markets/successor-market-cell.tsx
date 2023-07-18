import type { VegaICellRendererParams } from '@vegaprotocol/datagrid';
import { MarketNameCell } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketProvider } from '@vegaprotocol/markets';
import type { ProposalListFieldsFragment } from '@vegaprotocol/proposals';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import type { Row } from './closed';

export const SuccessorMarketRenderer = ({
  value,
}: VegaICellRendererParams<
  Row | ProposalListFieldsFragment,
  'successorMarketID'
>) => {
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
