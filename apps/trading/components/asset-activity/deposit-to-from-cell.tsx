import { BlockExplorerLink } from '@vegaprotocol/environment';
import { useTransactionReceipt } from 'wagmi';
import { useT } from '../../lib/use-t';
import { type RowDeposit } from './asset-activity';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

export const DepositToFromCell = ({ data }: { data: RowDeposit }) => {
  const t = useT();

  const { data: receipt } = useTransactionReceipt({
    hash: data.detail.txHash as `0x${string}`,
    chainId: Number(
      data.asset?.source.__typename === 'ERC20'
        ? Number(data.asset.source.chainId)
        : 1
    ),
  });

  if (!receipt) return null;
  if (data.asset?.source.__typename !== 'ERC20') return null;

  return (
    <>
      <span className="inline-block w-9">{t('From')}:</span>
      <BlockExplorerLink
        address={receipt.from}
        sourceChainId={Number(data.asset.source.chainId)}
      >
        {truncateMiddle(receipt.from)}
      </BlockExplorerLink>
    </>
  );
};
