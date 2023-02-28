import { t } from '@vegaprotocol/i18n';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useEtherscanLink } from '../hooks';

export const ContractAddressLink = ({ address }: { address: string }) => {
  const etherscanLink = useEtherscanLink();
  const href = etherscanLink(`/address/${address}`);
  return (
    <Link href={href} target="_blank" title={t('View on etherscan')}>
      {address}
    </Link>
  );
};
