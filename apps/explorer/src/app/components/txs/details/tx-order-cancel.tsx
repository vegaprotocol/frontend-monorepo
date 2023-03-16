import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import DeterministicOrderDetails from '../../order-details/deterministic-order-details';
import { CancelSummary } from '../../order-summary/order-cancellation';
import Hash from '../../links/hash';

interface TxDetailsOrderCancelProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Someone cancelled an order
 */
export const TxDetailsOrderCancel = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderCancelProps) => {
  if (!txData || !txData.command.orderCancellation) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const marketId: string = txData.command.orderCancellation.marketId;
  const orderId: string = txData.command.orderCancellation.orderId;

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
            {orderId ? (
              <Hash text={orderId} />
            ) : (
              <CancelSummary orderId={orderId} marketId={marketId} />
            )}
          </TableCell>
        </TableRow>
        {marketId ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Market')}</TableCell>
            <TableCell>
              <MarketLink id={marketId} />
            </TableCell>
          </TableRow>
        ) : null}
      </TableWithTbody>

      {orderId ? <DeterministicOrderDetails id={orderId} /> : null}
    </>
  );
};
