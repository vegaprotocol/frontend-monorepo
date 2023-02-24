import { t } from '@vegaprotocol/utils';
import { TableRow, TableCell } from '../../../table';

export interface TxDetailsChainEventErc20BridgePauseProps {
  isPaused: boolean;
}

/**
 * The bridge was either paused or unpaused, preventing withdrawals
 * or deposits from being enacted. This will only happen if the
 * validators have signed a multisig bundle requiring it to happen
 */
export const TxDetailsChainEventErc20BridgePause = ({
  isPaused,
}: TxDetailsChainEventErc20BridgePauseProps) => {
  const event = isPaused ? 'pause' : 'unpause';

  return (
    <TableRow modifier="bordered">
      <TableCell>{t('Chain event type')}</TableCell>
      <TableCell>{t(`ERC20 bridge ${event}`)}</TableCell>
    </TableRow>
  );
};
