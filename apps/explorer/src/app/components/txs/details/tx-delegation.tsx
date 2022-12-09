import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { NodeLink } from '../../links';
import GovernanceAssetBalance from '../../asset-balance/governance-asset-balance';

interface TxDetailsDelegateProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * An order type is probably the most interesting type we'll see! Except until:
 * https://github.com/vegaprotocol/vega/issues/6832 is complete, we can only
 * fetch the actual transaction and not more details about the order. So for now
 * this view is very basic.
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

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Node')}</TableCell>
        <TableCell>
          <NodeLink id={txData?.command.delegateSubmission.nodeId} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>
          <GovernanceAssetBalance
            price={txData?.command.delegateSubmission.amount}
          />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
