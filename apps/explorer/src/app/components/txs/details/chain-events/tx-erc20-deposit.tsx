import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink, PartyLink } from '../../../links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/eth-explorer-link/eth-explorer-link';

interface TxDetailsChainEventProps {
  deposit: components['schemas']['vegaERC20Deposit'];
}

/**
 * Someone deposited some erc20
 */
export const TxDetailsChainEventDeposit = ({
  deposit,
}: TxDetailsChainEventProps) => {
  if (!deposit) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 deposit')}</TableCell>
      </TableRow>
      {deposit.sourceEthereumAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Source')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={deposit.sourceEthereumAddress}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      ) : null}
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={deposit.targetPartyId || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink id={deposit.vegaAssetId || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{deposit.amount}</TableCell>
      </TableRow>
    </>
  );
};
