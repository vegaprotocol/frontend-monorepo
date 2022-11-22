import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { AssetLink, PartyLink } from '../../../links';

interface TxDetailsChainEventBuiltinDepositProps {
  withdrawal: components['schemas']['vegaBuiltinAssetWithdrawal'];
}

/**
 * Someone withdrew some of a builtin asset. Builtin assets
 * have no value outside the Vega chain and should appear only
 * on Test networks, so someone withdrawing it is pretty rare
 */
export const TxDetailsChainEventBuiltinWithdrawal = ({
  withdrawal,
}: TxDetailsChainEventBuiltinDepositProps) => {
  if (!withdrawal) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain Event type')}</TableCell>
        <TableCell>{t('Built-in asset withdrawal')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={withdrawal.partyId || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Asset')}</TableCell>
        <TableCell>
          <AssetLink id={withdrawal.vegaAssetId || ''} /> ({t('built in asset')}
          )
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{withdrawal.amount}</TableCell>
      </TableRow>
    </>
  );
};
