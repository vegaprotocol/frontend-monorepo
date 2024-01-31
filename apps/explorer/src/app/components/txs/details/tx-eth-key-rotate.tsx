import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../links/external-explorer-link/external-explorer-link';
import { BlockLink } from '../../links';

type EthKeyRotate = components['schemas']['v1EthereumKeyRotateSubmission'];
interface TxDetailsEthKeyRotateProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * A node is changing ethereum key
 */
export const TxDetailsEthKeyRotate = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsEthKeyRotateProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const k: EthKeyRotate = txData.command;

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
      {k.currentAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Old Address')}</TableCell>
          <TableCell>
            <ExternalExplorerLink
              type={EthExplorerLinkTypes.address}
              id={k.currentAddress}
            />
          </TableCell>
        </TableRow>
      ) : null}
      {k.newAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('New Address')}</TableCell>
          <TableCell>
            <ExternalExplorerLink
              type={EthExplorerLinkTypes.address}
              id={k.newAddress}
            />
          </TableCell>
        </TableRow>
      ) : null}
      {k.submitterAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Submitter address')}</TableCell>
          <TableCell>
            <ExternalExplorerLink
              type={EthExplorerLinkTypes.address}
              id={k.submitterAddress}
            />
          </TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
