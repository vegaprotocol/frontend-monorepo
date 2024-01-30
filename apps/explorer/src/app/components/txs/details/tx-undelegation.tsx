import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { NodeLink } from '../../links';
import GovernanceAssetBalance from '../../asset-balance/governance-asset-balance';
import type { components } from '../../../../types/explorer';

export const methodText: Record<
  components['schemas']['v1UndelegateSubmissionMethod'],
  string
> = {
  METHOD_NOW: 'Immediate',
  METHOD_UNSPECIFIED: 'Unspecified',
  METHOD_AT_END_OF_EPOCH: 'End of epoch',
};

interface TxDetailsUndelegateProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * There aren't currently good APIs for exploring delegations or epochs so this
 * view is currently a little basic - but it gives the key details.
 *
 * Future improvements could be:
 * - Show if the undelegation has taken effect or not, based on epoch
 * - Show the the total stake for the node after undelegation takes effect
 *
 * The signature can be turned in to an id with txSignatureToDeterministicId but
 * for now there are no details to fetch.
 */
export const TxDetailsUndelegate = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsUndelegateProps) => {
  if (!txData || !txData.command.undelegateSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const u: components['schemas']['v1UndelegateSubmission'] =
    txData.command.undelegateSubmission;

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {u.nodeId ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Node')}</TableCell>
          <TableCell>
            <NodeLink id={u.nodeId} />
          </TableCell>
        </TableRow>
      ) : null}
      {u.amount ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Amount')}</TableCell>
          <TableCell>
            <GovernanceAssetBalance price={u.amount} />
          </TableCell>
        </TableRow>
      ) : null}
      {u.method ? (
        <TableRow modifier="bordered">
          <TableCell>{t('When')}</TableCell>
          <TableCell>{methodText[u.method]}</TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
