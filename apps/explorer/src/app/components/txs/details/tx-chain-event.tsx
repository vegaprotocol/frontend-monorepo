import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type {
  BlockExplorerTransactionResult,
  ChainEvent,
} from '../../../routes/types/block-explorer-response';
import { AssetLink, PartyLink } from '../../links';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';

interface TxDetailsChainEventProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Chain events are external blockchain events (e.g. Ethereum) reported by bridge
 * Multiple events will relay the same data, from each validator, so that the
 * deposit/withdrawal can be verified independently.
 *
 * Design considerations so far:
 * - The ethereum address should be a link to an Ethereum explorer
 * - Sender and recipient are shown because they are easy
 * - Amount is not shown because there is no formatter by asset component
 */
export const TxDetailsChainEvent = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsChainEventProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  const cmd = txData.command as ChainEvent;
  const assetId = cmd.chainEvent.erc20.deposit.vegaAssetId;
  const sender = cmd.chainEvent.erc20.deposit.sourceEthereumAddress;
  const recipient = cmd.chainEvent.erc20.deposit.targetPartyId;

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink id={assetId} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Sender')}</TableCell>
        <TableCell>
          <span>{sender}</span>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={recipient} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
