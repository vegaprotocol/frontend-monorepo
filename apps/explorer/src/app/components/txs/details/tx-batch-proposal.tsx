import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { sharedHeaderProps, TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import { ProposalSummary } from './proposal/summary';
import Hash from '../../links/hash';
import { t } from '@vegaprotocol/i18n';

export type Proposal = components['schemas']['v1BatchProposalSubmission'];
export type ProposalTerms = components['schemas']['vegaProposalTerms'];

interface TxBatchProposalProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 *
 */
export const TxBatchProposal = ({
  txData,
  pubKey,
  blockData,
}: TxBatchProposalProps) => {
  if (!txData || !txData.command.batchProposalSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  let deterministicId = '';

  const proposal: Proposal = txData.command.batchProposalSubmission;
  const sig = txData?.signature?.value;
  if (sig) {
    deterministicId = txSignatureToDeterministicId(sig);
  }

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TableRow modifier="bordered">
          <TableCell {...sharedHeaderProps}>{t('Type')}</TableCell>
          <TableCell>{t('Batch proposal')}</TableCell>
        </TableRow>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
          hideTypeRow={true}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Batch size')}</TableCell>
          <TableCell>
            {proposal.terms?.changes?.length || t('No changes')}
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Proposal ID')}</TableCell>
          <TableCell>
            <Hash text={deterministicId} />
          </TableCell>
        </TableRow>
      </TableWithTbody>
      {proposal && (
        <ProposalSummary
          id={deterministicId}
          rationale={proposal?.rationale}
          terms={proposal.terms}
          batch={proposal.terms?.changes}
        />
      )}
    </>
  );
};
