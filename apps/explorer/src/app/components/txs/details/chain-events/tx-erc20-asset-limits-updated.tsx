import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink } from '../../../links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/eth-explorer-link/eth-explorer-link';

interface TxDetailsChainEventErc20AssetLimitsUpdatedProps {
  assetLimitsUpdated: components['schemas']['vegaERC20AssetLimitsUpdated'];
}

/**
 * An ERC20 asset was had its limits changed. The limits are in place
 * at first to prevent users depositing large sums while the network
 * is still new, as a safety measure.
 * - Lifetime limit is how much can be withdrawn of this asset to a
 *   single ethereum address
 * - Withdraw threshold is the size of a withdrawal that will incur
 *   a delay in processing. The delay is set by a network parameter
 */
export const TxDetailsChainEventErc20AssetLimitsUpdated = ({
  assetLimitsUpdated,
}: TxDetailsChainEventErc20AssetLimitsUpdatedProps) => {
  if (!assetLimitsUpdated) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 asset limits updated')}</TableCell>
      </TableRow>

      {assetLimitsUpdated.sourceEthereumAddress ? (
        <TableRow modifier="bordered">
          <TableCell>{t('ERC20 asset')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={assetLimitsUpdated.sourceEthereumAddress}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      ) : null}

      <TableRow modifier="bordered">
        <TableCell>{t('Vega asset')}</TableCell>
        <TableCell>
          <AssetLink id={assetLimitsUpdated.vegaAssetId || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Total lifetime limit')}</TableCell>
        <TableCell>{assetLimitsUpdated.lifetimeLimits}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Asset withdrawal threshold')}</TableCell>
        <TableCell>{assetLimitsUpdated.withdrawThreshold}</TableCell>
      </TableRow>
    </>
  );
};
