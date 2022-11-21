import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { PartyLink } from '../../../links';

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
  if (!remove) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain Event type')}</TableCell>
        <TableCell>{t('Stake removed')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Source')}</TableCell>
        <TableCell>{remove.ethereumAddress || ''}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={remove.vegaPublicKey || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{remove.amount}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Deposited at')}</TableCell>
        <TableCell>{remove.blockTime}</TableCell>
      </TableRow>
    </>
  );
};
