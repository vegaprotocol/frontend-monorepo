import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableRow, TableCell, TableWithTbody } from '../../table';

import type { components } from '../../../../types/explorer';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../links/external-explorer-link/external-explorer-link';
import { PartyLink } from '../../links';
import Hash from '../../links/hash';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

type Command = components['schemas']['v1AnnounceNode'];

interface TxDetailsNodeAnnounceProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * When a new potential validator node comes online, it announces
 * itself with this transaction.
 *
 * Design decisions:
 * - Signatures are not rendered. You can still access them via the
 *   TX details. This is consistent with explorers for other chains
 * - The avatar icon is rendered as a link rather than embedding
 */
export const TxDetailsNodeAnnounce = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsNodeAnnounceProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cmd: Command = txData.command.announceNode;

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {cmd.name ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Name')}</TableCell>
          <TableCell>
            <span>{cmd.name}</span>
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.id ? (
        <TableRow modifier="bordered">
          <TableCell>{t('ID')}</TableCell>
          <TableCell>
            <Hash text={cmd.id} />
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.chainPubKey ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Chain public key')}</TableCell>
          <TableCell>
            <Hash text={cmd.chainPubKey} />
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.ethereumAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Ethereum Address')}</TableCell>
          <TableCell>
            <ExternalExplorerLink
              type={EthExplorerLinkTypes.address}
              id={cmd.ethereumAddress}
            />
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.vegaPubKey ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Vega public key')}</TableCell>
          <TableCell>
            <PartyLink id={cmd.vegaPubKey} />
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.avatarUrl ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Avatar URL')}</TableCell>
          <TableCell>
            <ExternalLink href={cmd.avatarUrl} rel="noreferrer noopener">
              {cmd.avatarUrl}
            </ExternalLink>
          </TableCell>
        </TableRow>
      ) : null}
      {cmd.infoUrl ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Info link')}</TableCell>
          <TableCell>
            <ExternalLink href={cmd.infoUrl} rel="noreferrer noopener">
              {cmd.infoUrl}
            </ExternalLink>
          </TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
