import { BlockExplorerLink } from '@vegaprotocol/environment';

import { useT } from '../../lib/use-t';
import { type RowWithdrawal } from './use-asset-activity';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

export const WithdrawalToFromCell = ({ data }: { data: RowWithdrawal }) => {
  const t = useT();
  const receiverAddress = data.detail.details?.receiverAddress;

  const fallback = <>-</>;

  if (data.asset?.source.__typename !== 'ERC20') return fallback;
  if (!receiverAddress) return fallback;

  return (
    <>
      <span className="inline-block w-9">{t('To')}:</span>
      <BlockExplorerLink
        address={receiverAddress}
        sourceChainId={Number(data.asset.source.chainId)}
      >
        {truncateMiddle(receiverAddress)}
      </BlockExplorerLink>
    </>
  );
};
