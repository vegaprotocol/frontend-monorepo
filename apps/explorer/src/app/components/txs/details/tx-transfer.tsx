import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableRow, TableCell, TableWithTbody } from '../../table';

import type { components } from '../../../../types/explorer';
import { PartyLink } from '../../links';
import SizeInAsset from '../../size-in-asset/size-in-asset';
import { TransferRecurring } from './transfer/transfer-recurring';

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
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
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
