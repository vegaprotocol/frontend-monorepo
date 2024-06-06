import { Link } from 'react-router-dom';
import { ETHERSCAN_ADDRESS, useEtherscanLink } from '@vegaprotocol/environment';
import { useEthereumConfig, useTransactionReceipt } from '@vegaprotocol/web3';
import { useT } from '../../lib/use-t';
import { type RowDeposit } from './asset-activity';

export const DepositToFromCell = ({ data }: { data: RowDeposit }) => {
  const t = useT();
  const { config } = useEthereumConfig();
  const etherscanLink = useEtherscanLink(Number(config?.chain_id || 1));
  const { receipt } = useTransactionReceipt({
    txHash: data.detail.txHash,
  });

  if (!receipt) return null;

  return (
    <>
      {t('From')}:{' '}
      <Link
        to={etherscanLink(ETHERSCAN_ADDRESS.replace(':hash', receipt.from))}
        className="underline underline-offset-4"
        target="_blank"
      >
        {receipt.from}
      </Link>
    </>
  );
};
