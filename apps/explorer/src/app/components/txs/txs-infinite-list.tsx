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
  hasFilters?: boolean;
}

interface ItemProps {
  tx: BlockExplorerTransactionResult;
}

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
  hasFilters = false,
}: TxsInfiniteListProps) => {
  if (!txs || txs.length === 0) {
    if (!areTxsLoading) {
      return (
        <EmptyList
          heading={t('No transactions found')}
          label={
            hasFilters ? t('Try a different filter') : t('Check back soon')
          }
        />
      );
    } else {
      return <Loader />;
    }
  }

  return (
    <div>
      <table className={className} data-testid="transactions-list">
        <thead>
          <tr className="w-full mb-3 text-vega-dark-300 uppercase text-left">
            <th>
              <span className="hidden xl:inline">{t('Txn')} &nbsp;</span>
              <span>ID</span>
            </th>
            <th>{t('Type')}</th>
            <th className="text-left">{t('From')}</th>
            <th>{t('Block')}</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <Item key={t.hash} tx={t} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
