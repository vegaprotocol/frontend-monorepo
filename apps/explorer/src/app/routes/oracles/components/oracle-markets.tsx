import { getNodes, t } from '@vegaprotocol/react-helpers';
import { MarketLink } from '../../../components/links';
import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { ExplorerOracleForMarketsMarketFragment } from '../__generated__/OraclesForMarkets';
import { useExplorerOracleFormMarketsQuery } from '../__generated__/OraclesForMarkets';

interface OracleMarketsProps {
  id: string;
}

export function OracleMarkets({ id }: OracleMarketsProps) {
  const { data } = useExplorerOracleFormMarketsQuery({
    fetchPolicy: 'cache-first',
  });

  const markets = getNodes<ExplorerOracleForMarketsMarketFragment>(
    data?.marketsConnection
  );

  if (markets) {
    const m = markets.find((m) => {
      const p = m.tradableInstrument.instrument.product;
      if (
        p.dataSourceSpecForSettlementData.id === id ||
        p.dataSourceSpecForTradingTermination.id === id
      ) {
        return true;
      }
      return false;
    });

    if (m && m.id) {
      const type =
        id ===
        m.tradableInstrument.instrument.product.dataSourceSpecForSettlementData
          .id
          ? 'Settlement for'
          : 'Termination for';
      return (
        <TableRow modifier="bordered">
          <TableHeader scope="row">{type}</TableHeader>
          <TableCell modifier="bordered">
            <MarketLink id={m.id} />
          </TableCell>
        </TableRow>
      );
    }
  }
  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">{t('Market')}</TableHeader>
      <TableCell modifier="bordered">
        <span>{id}</span>
      </TableCell>
    </TableRow>
  );
}
