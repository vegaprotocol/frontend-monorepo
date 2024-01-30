import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/external-explorer-link/external-explorer-link';

interface TxDetailsChainEventStakeTotalSupplyProps {
  update: components['schemas']['vegaStakeTotalSupply'];
}

/**
 * Chain event set the total supply of the governance asset
 * Happens whenever the total supply changes, or when the chain
 * restarts and the total supply is detected.
 */
export const TxDetailsChainEventStakeTotalSupply = ({
  update,
}: TxDetailsChainEventStakeTotalSupplyProps) => {
  if (!update || !update.tokenAddress || !update.totalSupply) {
    return null;
  }

  const totalSupply =
    update.totalSupply.length > 0
      ? formatNumber(toBigNum(update.totalSupply, 18))
      : update.totalSupply;

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('Stake total supply update')}</TableCell>
      </TableRow>

      <TableRow modifier="bordered">
        <TableCell>{t('Source')}</TableCell>
        <TableCell>
          <ExternalExplorerLink
            id={update.tokenAddress}
            type={EthExplorerLinkTypes.address}
          />
        </TableCell>
      </TableRow>

      <TableRow modifier="bordered">
        <TableCell>{t('Total supply')}</TableCell>
        <TableCell>{totalSupply}</TableCell>
      </TableRow>
    </>
  );
};
