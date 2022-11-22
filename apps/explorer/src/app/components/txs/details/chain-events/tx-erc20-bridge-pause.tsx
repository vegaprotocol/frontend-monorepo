import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';

interface TxDetailsChainEventErc20BridgePause {
  isPaused: boolean;
}

/**
 * The bridge was either paused or unpaused, preventing withdrawals
 * or deposits from being enacted. This will only happen if the
 * validators have signed a multisig bundle requiring it to happen
 */
export const TxDetailsChainEventErc20BridgePause = ({
  isPaused,
}: TxDetailsChainEventErc20BridgePause) => {
  const event = isPaused ? 'pause' : 'unpaused';

  return (
    <TableRow modifier="bordered">
      <TableCell>{t('Chain event type')}</TableCell>
      <TableCell>{t(`ERC20 bridge ${event}`)}</TableCell>
    </TableRow>
  );
};
