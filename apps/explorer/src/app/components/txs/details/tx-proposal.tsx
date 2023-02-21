import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import ProposalLink from '../../links/proposal-link/proposal-link';
import type { components } from '../../../../types/explorer';
import Hash from '../../links/hash';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';

type Proposal = components['schemas']['v1ProposalSubmission'];

interface TxProposalProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * A proposal. It's more simplistic than man other views because there are already other, better
 * ways to view things about a proposal!
 *
 */
export const TxProposal = ({ txData, pubKey, blockData }: TxProposalProps) => {
  if (!txData || !txData.command.proposalSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  let deterministicId = '';

  const proposal: Proposal = txData.command.proposalSubmission;
  const sig = txData?.signature?.value;
  if (sig) {
    deterministicId = txSignatureToDeterministicId(sig);
  }

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Proposal details')}</TableCell>
        <TableCell>
          <ProposalLink id={deterministicId} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
