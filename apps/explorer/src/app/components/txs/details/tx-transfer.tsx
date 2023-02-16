import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type {
  Block,
  TendermintBlocksResponse,
} from '../../../routes/blocks/tendermint-blocks-response';
import { sharedHeaderProps, TxDetailsShared } from './shared/tx-details-shared';
import { TableRow, TableCell, TableWithTbody } from '../../table';

import type { components } from '../../../../types/explorer';
import { PartyLink } from '../../links';
import SizeInAsset from '../../size-in-asset/size-in-asset';
import { TransferRecurring } from './transfer/transfer-recurring';
import {
  SPECIAL_CASE_NETWORK,
  SPECIAL_CASE_NETWORK_ID,
} from '../../links/party-link/party-link';

type Transfer = components['schemas']['commandsv1Transfer'];

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
export const TxDetailsTransfer = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsNodeAnnounceProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const transfer: Transfer = txData.command.transfer;
  if (!transfer) {
    return <>{t('Transfer data missing')}</>;
  }

  const from = txData.submitter;

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TableRow modifier="bordered">
          <TableCell {...sharedHeaderProps}>{t('Type')}</TableCell>
          <TableCell>{getTypeLabelForTransfer(transfer)}</TableCell>
        </TableRow>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
          hideTypeRow={true}
        />
        {from ? (
          <TableRow modifier="bordered">
            <TableCell>{t('From')}</TableCell>
            <TableCell>
              <PartyLink id={from} />
            </TableCell>
          </TableRow>
        ) : null}
        {transfer.to ? (
          <TableRow modifier="bordered">
            <TableCell>{t('To')}</TableCell>
            <TableCell>
              <PartyLink id={transfer.to} />
            </TableCell>
          </TableRow>
        ) : null}
        {transfer.asset && transfer.amount ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Amount')}</TableCell>
            <TableCell>
              <SizeInAsset assetId={transfer.asset} size={transfer.amount} />
            </TableCell>
          </TableRow>
        ) : null}
      </TableWithTbody>
      <TransferRecurring from={from} transfer={transfer} />
    </>
  );
};

/**
 * Gets a string description of this transfer
 * @param txData A full transfer
 * @returns string Transfer label
 */
export function getTypeLabelForTransfer(tx: Transfer) {
  if (tx.to === SPECIAL_CASE_NETWORK || tx.to === SPECIAL_CASE_NETWORK_ID) {
    if (tx.recurring && tx.recurring.dispatchStrategy) {
      return 'Reward top up transfer';
    }
    // Else: we don't know that it's a reward transfer, so let's not guess
  } else if (tx.recurring) {
    return 'Recurring transfer';
  } else if (tx.oneOff) {
    // Currently redundant, but could be used to indicate something more specific
    return 'Transfer';
  }

  return 'Transfer';
}
