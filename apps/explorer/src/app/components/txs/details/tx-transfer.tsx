import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { sharedHeaderProps, TxDetailsShared } from './shared/tx-details-shared';
import { TableRow, TableCell, TableWithTbody } from '../../table';

import type { components } from '../../../../types/explorer';
import { PartyLink } from '../../links';
import SizeInAsset from '../../size-in-asset/size-in-asset';
import { TransferDetails } from './transfer/transfer-details';
import {
  SPECIAL_CASE_NETWORK,
  SPECIAL_CASE_NETWORK_ID,
} from '../../links/party-link/party-link';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';

type Transfer = components['schemas']['commandsv1Transfer'];

interface TxDetailsNodeAnnounceProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Displays the details of a transfer. Broadly there are three distinct
 * types of transfer, listed below in order of complexity:
 *
 * - A one off transfer
 * - A recurring transfer
 * - A recurring rewards pool transfer
 *
 * One off transfers are simple, really the important data is the amount
 * and who sent it to whom. This is rendered as one distinct box.
 *
 * A recurring transfer has two components - the same as above, and an
 * additional box that shows details about how it repeats. This is defined
 * as a start epoch and and end epoch. The Epoch/MissingEpoch components
 * render slightly differently depending on if the epoch is in the past,
 * current or in the future.
 *
 * Finally rewards pool transfers get the two boxes above, and an additional
 * one that describes how the reward is distributed.
 *
 * The information is split up in to three boxes to allow for the reuse across
 * all the types of transfer above.
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
        <TableRow modifier="bordered" data-testid="type">
          <TableCell {...sharedHeaderProps}>{t('Type')}</TableCell>
          <TableCell>{getTypeLabelForTransfer(transfer)}</TableCell>
        </TableRow>
        <TableRow modifier="bordered" data-testid="id">
          <TableCell {...sharedHeaderProps}>{t('Transfer ID')}</TableCell>
          <TableCell>
            {txSignatureToDeterministicId(txData.signature.value)}
          </TableCell>
        </TableRow>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
          hideTypeRow={true}
        />
        {from ? (
          <TableRow modifier="bordered" data-testid="from">
            <TableCell>{t('From')}</TableCell>
            <TableCell>
              <PartyLink id={from} />
            </TableCell>
          </TableRow>
        ) : null}
        {transfer.to ? (
          <TableRow modifier="bordered" data-testid="to">
            <TableCell>{t('To')}</TableCell>
            <TableCell>
              <PartyLink id={transfer.to} />
            </TableCell>
          </TableRow>
        ) : null}
        {transfer.asset && transfer.amount ? (
          <TableRow modifier="bordered" data-testid="amount">
            <TableCell>{t('Amount')}</TableCell>
            <TableCell>
              <SizeInAsset assetId={transfer.asset} size={transfer.amount} />
            </TableCell>
          </TableRow>
        ) : null}
      </TableWithTbody>
      <TransferDetails from={from} transfer={transfer} />
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
