import { t } from '@vegaprotocol/i18n';
import { TableCell, TableRow } from '../../../table';
import type { VegaPeggedReference } from '../liquidity-provision/liquidity-provision-details';
import { PeggedReferenceMapping } from '@vegaprotocol/types';
import { useExplorerMarketQuery } from '../../../links/market-link/__generated__/Market';
import type { ExplorerMarketQuery } from '../../../links/market-link/__generated__/Market';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export interface TxDetailsOrderProps {
  offset: string;
  reference: VegaPeggedReference;
  marketId: string;
}

export function getSettlementAsset(
  data: ExplorerMarketQuery | undefined
): number {
  return data?.market?.decimalPlaces || 0;
}

/**
 * Summarises an order's peg
 */
export const TxOrderPeggedReferenceRow = ({
  offset,
  reference,
  marketId,
}: TxDetailsOrderProps) => {
  return (
    <TableRow modifier="bordered">
      <TableCell>{t('Pegged order')}</TableCell>
      <TableCell>
        <TxOrderPeggedReference
          offset={offset}
          reference={reference}
          marketId={marketId}
        />
      </TableCell>
    </TableRow>
  );
};

export const TxOrderPeggedReference = ({
  offset,
  reference,
  marketId,
}: TxDetailsOrderProps) => {
  const { data, loading } = useExplorerMarketQuery({
    variables: { id: marketId },
  });
  const decimalPlaces = getSettlementAsset(data);

  if (reference === 'PEGGED_REFERENCE_UNSPECIFIED') {
    return null;
  }

  return (
    <>
      {!loading && data
        ? addDecimalsFormatNumber(offset, decimalPlaces)
        : offset}{' '}
      {t('from')} {PeggedReferenceMapping[reference]}
    </>
  );
};
