import { getNodes } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { MarketLink } from '../../../components/links';
import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { ExplorerOracleForMarketsMarketFragment } from '../__generated__/OraclesForMarkets';
import { useExplorerOracleFormMarketsQuery } from '../__generated__/OraclesForMarkets';

interface OracleMarketsProps {
  id: string;
}

/**
 * Slightly misleading names, OracleMarkets lists the market (almost always singular)
 * to which an oracle is attached. It also checks what it triggers, by checking on the
 * market whether it is attached to the dataSourceSpecForSettlementData or ..TradingTermination
 */
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
        ((p.__typename === 'Future' || p.__typename === 'Perpetual') &&
          p.dataSourceSpecForSettlementData.id === id) ||
        ('dataSourceSpecForTradingTermination' in p &&
          p.dataSourceSpecForTradingTermination.id === id)
      ) {
        return true;
      }
      return false;
    });

    if (m && m.id) {
      return (
        <TableRow modifier="bordered">
          <TableHeader scope="row">{getLabel(id, m)}</TableHeader>
          <TableCell modifier="bordered" data-testid={`m-${m.id}`}>
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

export function getLabel(
  id: string,
  m: ExplorerOracleForMarketsMarketFragment | null
): string {
  const settlementId =
    ((m?.tradableInstrument?.instrument?.product?.__typename === 'Future' ||
      m?.tradableInstrument?.instrument?.product?.__typename === 'Perpetual') &&
      m?.tradableInstrument?.instrument?.product
        ?.dataSourceSpecForSettlementData?.id) ||
    null;

  const terminationId =
    (m?.tradableInstrument?.instrument?.product?.__typename === 'Future' &&
      m?.tradableInstrument?.instrument?.product
        ?.dataSourceSpecForTradingTermination?.id) ||
    null;

  const settlementScheduleId =
    (m?.tradableInstrument?.instrument?.product?.__typename === 'Perpetual' &&
      m?.tradableInstrument?.instrument?.product
        ?.dataSourceSpecForSettlementSchedule?.id) ||
    null;

  switch (id) {
    case settlementId:
      return 'Settlement for';
    case terminationId:
      return 'Termination for';
    case settlementScheduleId:
      return 'Settlement schedule for';
    default:
      return 'Unknown';
  }
}
