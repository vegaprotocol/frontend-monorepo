import { DepositStatus, DepositStatusMapping } from '@vegaprotocol/types';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useTransactionConfirmations } from 'wagmi';

import { useT } from '../../lib/use-t';
import { type RowDeposit } from './use-asset-activity';
import { SECOND } from '@vegaprotocol/utils';

export const DepositStatusCell = ({ data }: { data: RowDeposit }) => {
  const t = useT();
  const { config } = useEthereumConfig();

  const { data: confirmations } = useTransactionConfirmations({
    hash: data.detail.txHash as `0x${string}`,
    query: {
      enabled: data.detail.status === DepositStatus.STATUS_OPEN,
      refetchInterval: 12 * SECOND,
    },
  });

  if (data.detail.status === DepositStatus.STATUS_OPEN) {
    return (
      <>
        {DepositStatusMapping[data.detail.status]}: (
        {confirmations ? confirmations.toString() : 0}
        {'/'}
        {config?.confirmations} {t('Confirmations')})
      </>
    );
  }

  if (data.detail.status === DepositStatus.STATUS_DUPLICATE_REJECTED) {
    return (
      <>
        {t('Failed')}: {DepositStatusMapping[data.detail.status]}
      </>
    );
  }

  return <>{DepositStatusMapping[data.detail.status]}</>;
};
