import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink } from '../../../links';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/external-explorer-link/external-explorer-link';

interface TxDetailsChainEventWithdrawalProps {
  withdrawal: components['schemas']['vegaERC20Withdrawal'];
}

/**
 * Someone deposited some erc20
 */
export const TxDetailsChainEventWithdrawal = ({
  withdrawal,
}: TxDetailsChainEventWithdrawalProps) => {
  if (
    !withdrawal ||
    !withdrawal.targetEthereumAddress ||
    !withdrawal.vegaAssetId
  ) {
    return null;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 withdrawal')}</TableCell>
      </TableRow>

      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <ExternalExplorerLink
            id={withdrawal.targetEthereumAddress}
            type={EthExplorerLinkTypes.address}
          />
        </TableCell>
      </TableRow>

      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink assetId={withdrawal.vegaAssetId} />
        </TableCell>
      </TableRow>
    </>
  );
};
