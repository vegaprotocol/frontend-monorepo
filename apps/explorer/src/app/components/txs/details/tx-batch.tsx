import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type {
  BlockExplorerTransactionResult,
  BatchMarketInstructions,
} from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody, TableRow, TableCell } from '../../table';

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
 */
export const TxDetailsBatch = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsBatchProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cmd = txData.command as BatchMarketInstructions;

  const batchSubmissions = cmd.batchMarketInstructions.submissions.length;
  const batchAmendments = cmd.batchMarketInstructions.amendments.length;
  const batchCancellations = cmd.batchMarketInstructions.cancellations.length;
  const batchTotal = batchSubmissions + batchAmendments + batchCancellations;

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Batch size')}</TableCell>
        <TableCell>
          <span>{batchTotal}</span>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>
          <span className="ml-5">{t('Submissions')}</span>
        </TableCell>
        <TableCell>
          <span>{batchSubmissions}</span>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>
          <span className="ml-5">{t('Amendments')}</span>
        </TableCell>
        <TableCell>
          <span>{batchAmendments}</span>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>
          <span className="ml-5">{t('Cancellations')}</span>
        </TableCell>
        <TableCell>
          <span>{batchCancellations}</span>
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
