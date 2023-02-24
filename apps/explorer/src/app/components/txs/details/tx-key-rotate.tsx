import { t } from '@vegaprotocol/utils';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { BlockLink, PartyLink } from '../../links';

type KeyRotate = components['schemas']['v1KeyRotateSubmission'];
interface TxDetailsKeyRotateProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * A node is changing Vega key
 */
export const TxDetailsKeyRotate = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsKeyRotateProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const k: KeyRotate = txData.command;

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {k.targetBlock ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Target block')}</TableCell>
          <TableCell>
            <BlockLink height={k.targetBlock} />
          </TableCell>
        </TableRow>
      ) : null}
      {k.currentPubKeyHash ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Old Address')}</TableCell>
          <TableCell>
            <PartyLink id={k.currentPubKeyHash} />
          </TableCell>
        </TableRow>
      ) : null}
      {k.currentPubKeyHash ? (
        <TableRow modifier="bordered">
          <TableCell>{t('New Address')}</TableCell>
          <TableCell>
            <PartyLink id={k.currentPubKeyHash} />
          </TableCell>
        </TableRow>
      ) : null}
      {k.newPubKeyIndex ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Key index')}</TableCell>
          <TableCell>
            <code>{k.newPubKeyIndex}</code>
          </TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
