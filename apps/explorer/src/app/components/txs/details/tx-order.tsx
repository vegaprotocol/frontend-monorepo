import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import DeterministicOrderDetails from '../../order-details/deterministic-order-details';
import Hash from '../../links/hash';
import { TxOrderPeggedReferenceRow } from './order/tx-order-peg';
import { TxOrderIcebergDetails } from './order/tx-order-iceberg';

interface TxDetailsOrderProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * An order type is probably the most interesting type we'll see! Except until:
 * https://github.com/vegaprotocol/vega/issues/6832 is complete, we can only
 * fetch the actual transaction and not more details about the order. So for now
 * this view is very basic
 */
export const TxDetailsOrder = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderProps) => {
  if (!txData || !txData.command.orderSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  const marketId = txData.command.orderSubmission.marketId || '-';
  const reference = txData.command.orderSubmission.peggedOrder;
  const side = txData.command.orderSubmission.side;
  const iceberg = txData.command.orderSubmission.icebergOpts;
  const size = txData.command.orderSubmission.size;

  let deterministicId = '';

  const sig = txData?.signature?.value;
  if (sig) {
    deterministicId = txSignatureToDeterministicId(sig);
  }

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
            <Hash text={deterministicId} />
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Market ID')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} showMarketName={false} />
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} />
          </TableCell>
        </TableRow>
        {reference ? (
          <TxOrderPeggedReferenceRow
            side={side}
            offset={reference.offset}
            reference={reference.reference}
            marketId={marketId}
          />
        ) : null}
        {iceberg ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Iceberg details')}</TableCell>
            <TableCell>
              <TxOrderIcebergDetails
                iceberg={iceberg}
                size={size}
                marketId={marketId}
              />
            </TableCell>
          </TableRow>
        ) : null}
      </TableWithTbody>

      {deterministicId.length > 0 ? (
        <DeterministicOrderDetails id={deterministicId} version={1} />
      ) : null}
    </>
  );
};
