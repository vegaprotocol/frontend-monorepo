import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { PartyLink } from '../../../links/party-link/party-link';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/external-explorer-link/external-explorer-link';

interface TxDetailsChainEventStakeDepositProps {
  deposit: components['schemas']['vegaStakeDeposited'];
}

/**
 * Someone added some stake for a particular party
 * This should link to the Governance asset, but doesn't
 * as that would require checking the Network Parameters
 * Ethereum address should also be a link to an ETH block explorer
 */
export const TxDetailsChainEventStakeDeposit = ({
  deposit,
}: TxDetailsChainEventStakeDepositProps) => {
  if (
    !deposit ||
    !deposit.ethereumAddress ||
    !deposit.vegaPublicKey ||
    !deposit.amount ||
    !deposit.blockTime
  ) {
    return null;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('Stake deposit')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Source')}</TableCell>
        <TableCell>
          <ExternalExplorerLink
            id={deposit.ethereumAddress}
            type={EthExplorerLinkTypes.address}
          />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={deposit.vegaPublicKey || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{deposit.amount}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Deposited at')}</TableCell>
        <TableCell>{deposit.blockTime}</TableCell>
      </TableRow>
    </>
  );
};
