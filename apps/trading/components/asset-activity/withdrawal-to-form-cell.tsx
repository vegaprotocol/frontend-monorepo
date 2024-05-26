import { Link } from 'react-router-dom';

import { useEthereumConfig } from '@vegaprotocol/web3';
import { ETHERSCAN_ADDRESS, useEtherscanLink } from '@vegaprotocol/environment';

import { useT } from '../../lib/use-t';
import { type RowWithdrawal } from './asset-activity';

export const WithdrawalToFromCell = ({ data }: { data: RowWithdrawal }) => {
  const t = useT();
  const { config } = useEthereumConfig();
  const etherscanLink = useEtherscanLink(Number(config?.chain_id || 1));
  const receiverAddress = data.detail.details?.receiverAddress;

  if (!receiverAddress) return <>-</>;

  return (
    <>
      {t('To')}:{' '}
      <Link
        to={etherscanLink(ETHERSCAN_ADDRESS.replace(':hash', receiverAddress))}
        className="underline underline-offset-4"
        target="_blank"
      >
        {receiverAddress}
      </Link>
    </>
  );
};
