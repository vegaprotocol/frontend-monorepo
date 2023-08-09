import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import DeterministicOrderDetails from '../../order-details/deterministic-order-details';
import { CancelSummary } from '../../order-summary/order-cancellation';
import Hash from '../../links/hash';

interface TxDetailsStopOrderCancelProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Someone cancelled a stop order
 */
export const TxDetailsStopOrderCancel = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsStopOrderCancelProps) => {
  if (!txData || !txData.command.stopOrdersCancellation) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const marketId: string = txData.command.stopOrdersCancellation.marketId;
  const orderId: string = txData.command.stopOrdersCancellation.orderId;

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Cancel stop order')}</TableCell>
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
