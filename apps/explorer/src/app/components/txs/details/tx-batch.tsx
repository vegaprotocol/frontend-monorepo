import { t } from '@vegaprotocol/i18n';
import type {
  BatchCancellationInstruction,
  BatchInstruction,
  BlockExplorerTransactionResult,
} from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody, TableRow, TableCell, Table } from '../../table';
import { BatchCancel } from './batch-submission/batch-cancel';
import { BatchAmend } from './batch-submission/batch-amend';
import { BatchOrder } from './batch-submission/batch-order';

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
  let index = 0;
  return (
    <div key={`tx-${index}`}>
      <TableWithTbody className="mb-8" allowWrap={true}>
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
            <th align="left">{t('#')}</th>
            <th align="left">{t('Type')}</th>
            <th align="left">{t('Order')}</th>
            <th align="left">{t('Market')}</th>
          </TableRow>
        </thead>
        <tbody>
          {cancellations.map((c) => (
            <BatchCancel key={`bc-${index}`} submission={c} index={index++} />
          ))}
          {amendments.map((a) => (
            <BatchAmend key={`ba-${index}`} submission={a} index={index++} />
          ))}
          {submissions.map((s) => (
            <BatchOrder key={`bo-${index}`} submission={s} index={index++} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};
