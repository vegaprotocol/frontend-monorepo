import { t } from '@vegaprotocol/react-helpers';
import type {
  BatchCancellationInstruction,
  BatchInstruction,
  BlockExplorerTransactionResult,
} from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody, TableRow, TableCell, Table } from '../../table';
import { TxOrderType } from '../tx-order-type';
import { TruncateInline } from '../../truncate/truncate';

interface TxDetailsBatchProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * BatchMarketInstructions are sets of changes in three categories: new orders (submissions),
 * order change s(amendments) and cancellations.
 *
 * Design considerations for batch:
 * - So far it's very basic details about the size of the batch
 *
 * Batches are processed in the following order:
 * - Cancellations
 * - Amends
 * - Submissions
 */
export const TxDetailsBatch = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsBatchProps) => {
  if (!txData || !txData.command.batchMarketInstructions) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const submissions: BatchInstruction[] =
    txData.command.batchMarketInstructions.submissions;
  const countSubmissions = submissions?.length || 0;

  const amendments: BatchInstruction[] =
    txData.command.batchMarketInstructions.amendments;
  const countAmendments = amendments?.length || 0;

  const cancellations: BatchCancellationInstruction[] =
    txData.command.batchMarketInstructions.cancellations;
  const countCancellations = cancellations.length || 0;
  const countTotal = countSubmissions + countAmendments + countCancellations;

  return (
    <div>
      <TableWithTbody className="mb-8">
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Batch size')}</TableCell>
          <TableCell>
            <span>{countTotal}</span>
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>
            <span className="ml-5">{t('Cancellations')}</span>
          </TableCell>
          <TableCell>
            <span>{countCancellations}</span>
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>
            <span className="ml-5">{t('Amendments')}</span>
          </TableCell>
          <TableCell>
            <span>{countAmendments}</span>
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>
            <span className="ml-5">{t('Submissions')}</span>
          </TableCell>
          <TableCell>
            <span>{countSubmissions}</span>
          </TableCell>
        </TableRow>
      </TableWithTbody>

      <Table className="max-w-5xl min-w-fit">
        <thead>
          <TableRow modifier="bordered" className="font-mono">
            <th>{t('Type')}</th>
            <th>{t('Market')}</th>
            <th>{t('Order')}</th>
          </TableRow>
        </thead>
        <tbody>
          {cancellations.length > 0
            ? cancellations.map((c) => {
                return (
                  <tr>
                    <td>
                      <TxOrderType orderType={'OrderCancellation'} />
                    </td>
                    <td>
                      <TruncateInline text={c.marketId} />
                    </td>
                    <td>
                      <TruncateInline text={c.orderId} />
                    </td>
                  </tr>
                );
              })
            : null}
          {amendments.length > 0
            ? amendments.map((a) => {
                return (
                  <tr>
                    <td>
                      <TxOrderType orderType={'OrderAmendment'} />
                    </td>
                    <td>
                      <TruncateInline text={a.marketId} />
                    </td>
                    <td>
                      <TruncateInline text={a.orderId} />
                    </td>
                  </tr>
                );
              })
            : null}
          {submissions.length > 0
            ? submissions.map((s) => {
                return (
                  <tr>
                    <td>
                      <TxOrderType orderType={'OrderSubmission'} />
                    </td>
                    <td>
                      <TruncateInline text={s.marketId} />
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </Table>
    </div>
  );
};
