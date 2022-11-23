import { formatNumber, t, toBigNum } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/eth-explorer-link/eth-explorer-link';

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
  if (!update) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  let totalSupply = update.totalSupply || '';
  if (totalSupply.length > 0) {
    totalSupply = formatNumber(toBigNum(totalSupply, 18));
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain Event type')}</TableCell>
        <TableCell>{t('Stake total supply update')}</TableCell>
      </TableRow>

      {update.tokenAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Source')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={update.tokenAddress}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      ) : null}
      <TableRow modifier="bordered">
        <TableCell>{t('Total supply')}</TableCell>
        <TableCell>{totalSupply}</TableCell>
      </TableRow>
    </>
  );
};
