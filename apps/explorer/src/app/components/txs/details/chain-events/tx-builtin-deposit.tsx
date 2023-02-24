import { t } from '@vegaprotocol/utils';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink, PartyLink } from '../../../links';

interface TxDetailsChainEventBuiltinDepositProps {
  deposit: components['schemas']['vegaBuiltinAssetDeposit'];
}

/**
 * Someone deposited some of a builtin asset. Builtin assets
 * have no value outside the Vega chain and should appear only
 * on Test networks.
 */
export const TxDetailsChainEventBuiltinDeposit = ({
  deposit,
}: TxDetailsChainEventBuiltinDepositProps) => {
  if (!deposit || !deposit.partyId || !deposit.vegaAssetId || !deposit.amount) {
    return null;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('Built-in asset deposit')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={deposit.partyId} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink assetId={deposit.vegaAssetId} /> ({t('built in asset')})
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{deposit.amount}</TableCell>
      </TableRow>
    </>
  );
};
