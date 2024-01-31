import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink, PartyLink } from '../../../links';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/external-explorer-link/external-explorer-link';

interface TxDetailsChainEventProps {
  deposit: components['schemas']['vegaERC20Deposit'];
}

/**
 * Someone deposited some erc20
 */
export const TxDetailsChainEventDeposit = ({
  deposit,
}: TxDetailsChainEventProps) => {
  if (
    !deposit ||
    !deposit.sourceEthereumAddress ||
    !deposit.targetPartyId ||
    !deposit.vegaAssetId ||
    !deposit.amount
  ) {
    return null;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 deposit')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Source')}</TableCell>
        <TableCell>
          <ExternalExplorerLink
            id={deposit.sourceEthereumAddress}
            type={EthExplorerLinkTypes.address}
          />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={deposit.targetPartyId} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink assetId={deposit.vegaAssetId} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{deposit.amount}</TableCell>
      </TableRow>
    </>
  );
};
