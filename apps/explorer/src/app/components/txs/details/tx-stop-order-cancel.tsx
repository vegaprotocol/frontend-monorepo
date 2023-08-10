import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import DeterministicOrderDetails from '../../order-details/deterministic-order-details';
import { CancelSummary } from '../../order-summary/order-cancellation';
import Hash from '../../links/hash';
import type { components } from '../../../../types/explorer';

export type StopOrderCancellationTransaction =
  components['schemas']['v1StopOrdersCancellation'];

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
  if (!txData || !txData.command.stopOrderId) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const command: StopOrderCancellationTransaction = txData.command;

  const { marketId, stopOrderId } = command;

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
            {stopOrderId ? (
              <Hash text={stopOrderId} />
            ) : (
              <CancelSummary orderId={stopOrderId} marketId={marketId} />
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

      {stopOrderId ? <DeterministicOrderDetails id={stopOrderId} /> : null}
    </>
  );
};
