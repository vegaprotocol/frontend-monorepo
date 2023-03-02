import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableRow, TableCell, TableWithTbody } from '../../table';

import type { components } from '../../../../types/explorer';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../links/eth-explorer-link/eth-explorer-link';
import { NodeLink } from '../../links';

type Command = components['schemas']['v1IssueSignatures'];

const kind: Record<components['schemas']['v1NodeSignatureKind'], string> = {
  NODE_SIGNATURE_KIND_UNSPECIFIED: 'Unspecified',
  NODE_SIGNATURE_KIND_ASSET_NEW: 'New asset',
  NODE_SIGNATURE_KIND_ASSET_WITHDRAWAL: 'Asset withdrawal',
  NODE_SIGNATURE_KIND_ASSET_UPDATE: ' Asset update',
  NODE_SIGNATURE_KIND_ERC20_MULTISIG_SIGNER_ADDED: 'Multisig signer added',
  NODE_SIGNATURE_KIND_ERC20_MULTISIG_SIGNER_REMOVED: 'Multisig signer removed',
};

interface TxDetailsGenericProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * If there is not yet a custom component for a transaction, just display
 * the basic details. This allows someone to view the decoded transaction.
 */
export const TxDetailsIssueSignatures = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsGenericProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cmd: Command = txData.command;
  const k = cmd.kind ? kind[cmd.kind] : null;

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {k ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Kind')}</TableCell>
          <TableCell>{k}</TableCell>
        </TableRow>
      ) : null}
      {cmd.submitter ? (
        <TableRow modifier="bordered">
          <TableCell>{t('ETH key')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={cmd.submitter}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.validatorNodeId ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Validator')}</TableCell>
          <TableCell>
            <NodeLink id={cmd.validatorNodeId} />
          </TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
