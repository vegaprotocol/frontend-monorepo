import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { PartyLink } from '../../../links';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/external-explorer-link/external-explorer-link';

interface TxDetailsChainEventStakeRemoveProps {
  remove: components['schemas']['vegaStakeRemoved'];
}

/**
 * Someone addedd some stake for a particular party
 * This should link to the Governance asset, but doesn't
 * as that would require checking the Network Parameters
 * Ethereum address should also be a link to an ETH block explorer
 */
export const TxDetailsChainEventStakeRemove = ({
  remove,
}: TxDetailsChainEventStakeRemoveProps) => {
  if (
    !remove ||
    !remove.ethereumAddress ||
    !remove.vegaPublicKey ||
    !remove.amount ||
    !remove.blockTime
  ) {
    return null;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('Stake remove')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Source')}</TableCell>
        <TableCell>
          <ExternalExplorerLink
            id={remove.ethereumAddress}
            type={EthExplorerLinkTypes.address}
          />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={remove.vegaPublicKey} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{remove.amount}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Removed at')}</TableCell>
        <TableCell>{remove.blockTime}</TableCell>
      </TableRow>
    </>
  );
};
