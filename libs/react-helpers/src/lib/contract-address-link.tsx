import { useEtherscanLink } from '@vegaprotocol/environment';
import { Link } from '@vegaprotocol/ui-toolkit';
import { t } from './i18n';

export const ContractAddressLink = ({ address }: { address: string }) => {
  const etherscanLink = useEtherscanLink();
  const href = etherscanLink(`/address/${address}`);
  return (
    <Link href={href} target="_blank" title={t('View on etherscan')}>
      {address}
    </Link>
  );
};
