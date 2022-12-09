import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../links/eth-explorer-link/eth-explorer-link';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import AssetBalance from '../../asset-balance/asset-balance';
import { useScrollToLocation } from '../../../hooks/scroll-to-location';

interface TxDetailsOrderCancelProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * The first part of a withdrawal. If the validators all approve this request (i.e. the user has the
 * required funds), they will produce a multisig bundle that can be submitted to the ERC20 bridge to
 * execute the withdrawal.
 */
export const TxDetailsWithdrawSubmission = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderCancelProps) => {
  useScrollToLocation();

  if (!txData || !txData.command.withdrawSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const w = txData.command.withdrawSubmission;

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>
          <AssetBalance price={w.amount} assetId={w.asset} />
        </TableCell>
      </TableRow>

      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <EthExplorerLink
            id={w.ext.erc20.receiverAddress}
            type={EthExplorerLinkTypes.address}
          />
        </TableCell>
      </TableRow>

      {txData?.signature?.value ? (
        <TableRow modifier="bordered">
          <TableCell>{t('ID?')}</TableCell>
          <TableCell>
            {txSignatureToDeterministicId(txData.signature.value)}
          </TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
