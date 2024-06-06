import { DepositStatus, DepositStatusMapping } from '@vegaprotocol/types';
import { useEthereumConfig, useTransactionReceipt } from '@vegaprotocol/web3';

import { useT } from '../../lib/use-t';
import { type RowDeposit } from './asset-activity';

export const DepositStatusCell = ({ data }: { data: RowDeposit }) => {
  const t = useT();
  const { config } = useEthereumConfig();

  const { receipt } = useTransactionReceipt({
    txHash: data.detail.txHash,
    enabled: data.detail.status === DepositStatus.STATUS_OPEN,
  });

  if (data.detail.status === DepositStatus.STATUS_OPEN) {
    return (
      <>
        {DepositStatusMapping[data.detail.status]} ({receipt?.confirmations}
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
