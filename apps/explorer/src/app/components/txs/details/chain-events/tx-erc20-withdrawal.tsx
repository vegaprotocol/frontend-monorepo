import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink } from '../../../links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/eth-explorer-link/eth-explorer-link';

interface TxDetailsChainEventWithdrawalProps {
  withdrawal: components['schemas']['vegaERC20Withdrawal'];
}

/**
 * Someone deposited some erc20
 */
export const TxDetailsChainEventWithdrawal = ({
  withdrawal,
}: TxDetailsChainEventWithdrawalProps) => {
  if (!withdrawal) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 withdrawal')}</TableCell>
      </TableRow>

      {withdrawal.targetEthereumAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Recipient')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={withdrawal.targetEthereumAddress}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      ) : null}

      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink id={withdrawal.vegaAssetId || ''} />
        </TableCell>
      </TableRow>
    </>
  );
};
