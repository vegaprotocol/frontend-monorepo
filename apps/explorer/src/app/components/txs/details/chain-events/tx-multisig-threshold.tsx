import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import isNumber from 'lodash/isNumber';
import { getBlockTime } from './lib/get-block-time';

interface TxDetailsChainMultisigThresholdProps {
  thresholdSet: components['schemas']['vegaERC20MultiSigEvent']['thresholdSet'];
}

/**
 * Someone updated multsig threshold value on the smart contract.
 * It's a percentage, with 1000 being 100% and 0 being 0%.
 *
 * - Nonce is not rendered. It's in the full transaction details thing
 *   in case anyone really wants it, but for now it feels like detail we don't need
 */
export const TxDetailsChainMultisigThreshold = ({
  thresholdSet,
}: TxDetailsChainMultisigThresholdProps) => {
  if (!thresholdSet || !thresholdSet.blockTime || !thresholdSet.newThreshold) {
    return null;
  }

  const blockTime = getBlockTime(thresholdSet.blockTime);
  const threshold = isNumber(thresholdSet.newThreshold)
    ? thresholdSet.newThreshold / 10
    : '-';

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>{t('ERC20 multisig threshold set')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Threshold')}</TableCell>
        <TableCell>{threshold}%</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Threshold change date')}</TableCell>
        <TableCell>{blockTime}</TableCell>
      </TableRow>
    </>
  );
};
