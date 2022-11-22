import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import isNumber from 'lodash/isNumber';

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
  thresholdSet: components['schemas']['vegaERC20MultiSigEvent']['thresholdSet'];
}

/**
 * Someone updated multsig threshold value on the smart contract.
 * It's a percentage, with 1000 being 100% and 0 being 0%.
 */
export const TxDetailsChainMultisigThreshold = ({
  thresholdSet,
}: TxDetailsChainMultisigThresholdProps) => {
  if (!thresholdSet) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const blockTime = getBlockTime(thresholdSet.blockTime);
  const threshold = isNumber(thresholdSet.newThreshold)
    ? thresholdSet.newThreshold / 10
    : '-';

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain Event type')}</TableCell>
        <TableCell>{t('ERC20 multisig threshold set')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Threshold')}</TableCell>
        <TableCell>{threshold}%</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Threshold set from')}</TableCell>
        <TableCell>{blockTime}</TableCell>
      </TableRow>
    </>
  );
};
