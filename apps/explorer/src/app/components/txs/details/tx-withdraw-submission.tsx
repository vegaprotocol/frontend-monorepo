import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../links/external-explorer-link/external-explorer-link';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import AssetBalance from '../../asset-balance/asset-balance';
import { useScrollToLocation } from '../../../hooks/scroll-to-location';
import { WithdrawalProgress } from '../../withdrawal/withdrawal-progress';

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
  const id = txData?.signature?.value
    ? txSignatureToDeterministicId(txData.signature.value)
    : '-';

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Amount')}</TableCell>
          <TableCell>
            <AssetBalance price={w.amount} assetId={w.asset} />
          </TableCell>
        </TableRow>

        <TableRow modifier="bordered">
          <TableCell>{t('Recipient')}</TableCell>
          <TableCell>
            <ExternalExplorerLink
              id={w.ext.erc20.receiverAddress}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      </TableWithTbody>
      {id !== '-' ? (
        <WithdrawalProgress id={id} txStatus={txData.code} />
      ) : null}
    </>
  );
};
