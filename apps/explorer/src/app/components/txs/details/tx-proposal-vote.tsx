import { t } from '@vegaprotocol/utils';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import ProposalLink from '../../links/proposal-link/proposal-link';

interface TxProposalVoteProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * A vote on a proposal.
 *
 * One inconsistency here that feels right but should be standardised is that there are two rows
 * for the proposal ID, one that creates a link with the text of the proposal title that takes
 * a user out to the governance site, and the other that just shows the ID. Both are useful, but
 * doesn't feel quite right. This could be fixed with a separate component to display a preview
 * of the proposal and link off to the governance site, removing the title from the header. Or
 * something else. For now, this is more useful than the default view
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
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Proposal ID')}</TableCell>
        <TableCell>{txData.command.voteSubmission.proposalId}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Proposal details')}</TableCell>
        <TableCell>
          <ProposalLink id={txData.command.voteSubmission.proposalId} />
        </TableCell>
      </TableRow>
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
