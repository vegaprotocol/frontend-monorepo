import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';

/**
 * Returns a reasonably formatted time from unix timestamp of block height
 *
 * @param date String or null date
 * @returns String date in locale time
 */
function getBlockTime(date?: string) {
  if (!date) {
    return '-';
  }

  const timeInSeconds = parseInt(date, 10);
  const timeInMs = timeInSeconds * 1000;

  return new Date(timeInMs).toLocaleString();
}

interface TxDetailsChainMultisigThresholdProps {
  multisigEvent: components['schemas']['vegaERC20MultiSigEvent'];
}

/**
 * Someone updated multsig threshold value on the smart contract.
 * It's a percentage
 */
export const TxDetailsChainMultisigThreshold = ({
  multisigEvent,
}: TxDetailsChainMultisigThresholdProps) => {
  if (!multisigEvent) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  if (multisigEvent.thresholdSet) {
    const blockTime = getBlockTime(multisigEvent.thresholdSet.blockTime);

    return (
      <>
        <TableRow modifier="bordered">
          <TableCell>{t('Threshold')}</TableCell>
          <TableCell>{multisigEvent.thresholdSet.newThreshold}</TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Threshold set from')}</TableCell>
          <TableCell>{blockTime}</TableCell>
        </TableRow>
      </>
    );
  }

  return null;
};
