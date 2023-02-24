import { t } from '@vegaprotocol/utils';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { getBlockTime } from './lib/get-block-time';

interface TxDetailsChainMultisigSignerProps {
  signer:
    | components['schemas']['vegaERC20SignerAdded']
    | components['schemas']['vegaERC20SignerRemoved'];
}

/**
 * Someone updated multsig signer set, either removing or adding someone
 */
export const TxDetailsChainMultisigSigner = ({
  signer,
}: TxDetailsChainMultisigSignerProps) => {
  if (!signer || !signer.blockTime) {
    return null;
  }

  const blockTime = getBlockTime(signer.blockTime);
  const target =
    'newSigner' in signer
      ? signer.newSigner
      : 'oldSigner' in signer
      ? signer.oldSigner
      : '';

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain event type')}</TableCell>
        <TableCell>
          {'newSigner' in signer
            ? t('Add ERC20 bridge multisig signer')
            : t('Remove ERC20 bridge multisig signer')}
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>
          {'newSigner' in signer ? t('Add signer') : t('Remove signer')}
        </TableCell>
        <TableCell>{target}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Signer change at')}</TableCell>
        <TableCell>{blockTime}</TableCell>
      </TableRow>
    </>
  );
};
