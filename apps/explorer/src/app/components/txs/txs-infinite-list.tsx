import { t } from '@vegaprotocol/i18n';
import { TxsInfiniteListItem } from './txs-infinite-list-item';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import EmptyList from '../empty-list/empty-list';
import { Loader } from '@vegaprotocol/ui-toolkit';

interface TxsInfiniteListProps {
  hasMoreTxs: boolean;
  areTxsLoading: boolean | undefined;
  txs: BlockExplorerTransactionResult[];
  loadMoreTxs: () => void;
  error: Error | undefined;
  className?: string;
}

interface ItemProps {
  tx: BlockExplorerTransactionResult;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const Item = ({ tx }: ItemProps) => {
  const { hash, submitter, type, command, block, code, index: blockIndex } = tx;
  return (
    <TxsInfiniteListItem
      type={type}
      code={code}
      command={command}
      submitter={submitter}
      hash={hash}
      block={block}
      index={blockIndex}
    />
  );
};

export const TxsInfiniteList = ({
  areTxsLoading,
  txs,
  className,
}: TxsInfiniteListProps) => {
  if (!txs) {
    if (!areTxsLoading) {
      return (
        <EmptyList
          heading={t('This chain has 0 transactions')}
          label={t('Check back soon')}
        />
      );
    } else {
      return <Loader />;
    }
  }

  return (
    <table className={className} data-testid="transactions-list">
      <thead>
        <tr className="lg:grid grid-cols-10 w-full mb-3 hidden text-vega-dark-300 uppercase">
          <th className="col-span-3">
            <span className="hidden xl:inline">{t('Transaction')} &nbsp;</span>
            <span>ID</span>
          </th>
          <th className="col-span-3">{t('Submitted By')}</th>
          <th className="col-span-2">{t('Type')}</th>
          <th className="col-span-1">{t('Block')}</th>
          <th className="col-span-1">{t('Success')}</th>
        </tr>
      </thead>
      <tbody>
        {txs.map((t) => (
          <Item key={t.hash} tx={t} />
        ))}
      </tbody>
    </table>
  );
};
