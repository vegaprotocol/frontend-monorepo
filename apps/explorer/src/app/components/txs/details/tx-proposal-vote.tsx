import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';

interface TxProposalVoteProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * A vote on a proposal
 */
export const TxProposalVote = ({
  txData,
  pubKey,
  blockData,
}: TxProposalVoteProps) => {
  if (!txData || !txData.command.voteSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const vote = txData.command.voteSubmission.value ? '👍' : '👎';
  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Proposal')}</TableCell>
        <TableCell>{txData.command.voteSubmission.proposalId}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Vote')}</TableCell>
        <TableCell>{vote}</TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
