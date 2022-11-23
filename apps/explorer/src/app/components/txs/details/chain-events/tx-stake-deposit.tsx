import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import type { components } from '../../../../../types/explorer';
import { PartyLink } from '../../../links';

interface TxDetailsChainEventStakeDepositProps {
  deposit: components['schemas']['vegaStakeDeposited'];
}

/**
 * Someone addedd some stake for a particular party
 * This should link to the Governance asset, but doesn't
 * as that would require checking the Network Paramters
 * Ethereum address should also be a link to an ETH block explorer
 */
export const TxDetailsChainEventStakeDeposit = ({
  deposit,
}: TxDetailsChainEventStakeDepositProps) => {
  if (!deposit) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Chain Event type')}</TableCell>
        <TableCell>{t('Stake deposited')}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Source')}</TableCell>
        <TableCell>{deposit.ethereumAddress || ''}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Recipient')}</TableCell>
        <TableCell>
          <PartyLink id={deposit.vegaPublicKey || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Amount')}</TableCell>
        <TableCell>{deposit.amount}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Deposited at')}</TableCell>
        <TableCell>{deposit.amount}</TableCell>
      </TableRow>
    </>
  );
};
