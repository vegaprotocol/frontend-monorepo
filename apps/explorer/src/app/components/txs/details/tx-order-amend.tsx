import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import AmendOrderDetails from '../../order-details/amend-order-details';

interface TxDetailsOrderAmendProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Amending an existing order
 */
export const TxDetailsOrderAmend = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderAmendProps) => {
  if (!txData || !txData.command.orderAmendment) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const marketId: string = txData.command.orderAmendment.marketId || '-';
  const orderId: string = txData.command.orderAmendment.orderId || '-';

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Order')}</TableCell>
          <TableCell>
            <code>{orderId}</code>
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} />
          </TableCell>
        </TableRow>
      </TableWithTbody>

      {orderId !== '-' ? (
        <AmendOrderDetails id={orderId} amend={txData.command.orderAmendment} />
      ) : null}
    </>
  );
};
