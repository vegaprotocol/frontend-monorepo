import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink } from '../../../links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/eth-explorer-link/eth-explorer-link';

interface TxDetailsChainEventErc20AssetListProps {
  assetList: components['schemas']['vegaERC20AssetList'];
}

/**
 * An ERC20 asset was proposed and then enacted on the bridge,
 * a Asset List event will be emitted that tells the core to
 * create the asset. That's this event - it's very basic
 */
export const TxDetailsChainEventErc20AssetList = ({
  assetList,
}: TxDetailsChainEventErc20AssetListProps) => {
  if (!assetList) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 asset added')}</TableCell>
      </TableRow>
      {assetList.assetSource ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Source')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={assetList.assetSource}
              type={EthExplorerLinkTypes.address}
            />
          </TableCell>
        </TableRow>
      ) : null}
      <TableRow modifier="bordered">
        <TableCell>{t('Added Vega asset')}</TableCell>
        <TableCell>
          <AssetLink id={assetList.vegaAssetId || ''} />
        </TableCell>
      </TableRow>
    </>
  );
};
