import { t } from '@vegaprotocol/utils';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink } from '../../../links';

interface TxDetailsChainEventErc20AssetDelistProps {
  assetDelist: components['schemas']['vegaERC20AssetDelist'];
}

/**
 * An ERC20 asset was removed from the bridge,
 * The link should link to an asset that doesn't exist. Which feels odd
 * but I think is better than having no link - in case something
 * weird is up and it still exists
 */
export const TxDetailsChainEventErc20AssetDelist = ({
  assetDelist,
}: TxDetailsChainEventErc20AssetDelistProps) => {
  if (!assetDelist || !assetDelist.vegaAssetId) {
    return null;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 asset removed')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Removed Vega asset')}</TableCell>
        <TableCell>
          <AssetLink assetId={assetDelist.vegaAssetId || ''} />
        </TableCell>
      </TableRow>
    </>
  );
};
