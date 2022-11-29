import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import DeterministicOrderDetails from '../../deterministic-order-details/deterministic-order-details';
import { InfoPanel } from '../../info-panel';

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

  const marketId = txData.command.orderCancellation.marketId || '-';
  const orderId = txData.command.orderCancellation.orderId || '-';

  return (
    <>
      <TableWithTbody>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} />
          </TableCell>
        </TableRow>
      </TableWithTbody>

      {orderId.length > 0 ? (
        <div className="mt-5">
          <InfoPanel title={t('Current Details')} id="current" copy={false}>
            <TableWithTbody>
              <DeterministicOrderDetails id={orderId} />
            </TableWithTbody>
          </InfoPanel>
        </div>
      ) : null}
    </>
  );
};
