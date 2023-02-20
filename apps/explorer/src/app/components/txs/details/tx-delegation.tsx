import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { NodeLink } from '../../links';
import GovernanceAssetBalance from '../../asset-balance/governance-asset-balance';
import type { components } from '../../../../types/explorer';

interface TxDetailsDelegateProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * There aren't currently good APIs for exploring delegations or epochs so this
 * view is currently a little basic - but it gives the key details.
 *
 * Future improvements could be:
 * - Show if the delegation has taken effect or not, based on epoch
 *
 * The signature can be turned in to an id with txSignatureToDeterministicId but
 * for now there are no details to fetch.
 */
export const TxDetailsDelegate = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsDelegateProps) => {
  if (!txData || !txData.command.delegateSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  const d: components['schemas']['v1DelegateSubmission'] =
    txData.command.delegateSubmission;

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {d.nodeId ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Node')}</TableCell>
          <TableCell>
            <NodeLink id={d.nodeId} />
          </TableCell>
        </TableRow>
      ) : null}
      {d.amount ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Amount')}</TableCell>
          <TableCell>
            <GovernanceAssetBalance price={d.amount} />
          </TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
