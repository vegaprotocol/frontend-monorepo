import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
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
  if (!txData || !txData.command.batchMarketInstructions) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const countSubmissions =
    txData.command.batchMarketInstructions.submissions?.length || 0;
  const countAmendments =
    txData.command.batchMarketInstructions.amendments?.length || 0;
  const countCancellations =
    txData.command.batchMarketInstructions.cancellations?.length || 0;
  const countTotal = countSubmissions + countAmendments + countCancellations;

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Batch size')}</TableCell>
        <TableCell>
          <span>{countTotal}</span>
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
          <span className="ml-5">{t('Cancellations')}</span>
        </TableCell>
        <TableCell>
          <span>{countCancellations}</span>
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
