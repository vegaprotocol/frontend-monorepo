import { Table, TableRow } from '../table';
import { t } from '@vegaprotocol/i18n';
import { useFetch } from '@vegaprotocol/react-helpers';
import { type BlockExplorerTransactions } from '../../routes/types/block-explorer-response';
import { getTxsDataUrl } from '../../hooks/get-txs-data-url';
import { AsyncRenderer, Loader } from '@vegaprotocol/ui-toolkit';
import EmptyList from '../empty-list/empty-list';
import { TxsInfiniteListItem } from './txs-infinite-list-item';

interface TxsPerBlockProps {
  blockHeight: string;
  txCount: number;
}

export const TxsPerBlock = ({ blockHeight, txCount }: TxsPerBlockProps) => {
  const filters = `filters[block.height]=${blockHeight}`;
  const url = getTxsDataUrl({ filters, count: txCount });
  const {
    state: { data, loading, error },
  } = useFetch<BlockExplorerTransactions>(url);

  return (
    <AsyncRenderer data={data} error={error} loading={!!loading}>
      {data && data.transactions.length > 0 ? (
        <div className="mb-28 overflow-x-auto whitespace-nowrap">
          <Table>
            <thead>
              <TableRow modifier="bordered" className="font-mono">
                <td>{t('Transaction')}</td>
                <td>{t('Type')}</td>
                <td>{t('From')}</td>
                <td>{t('Block')}</td>
              </TableRow>
            </thead>
            <tbody>
              {data.transactions.map(
                ({ hash, submitter, type, command, code, block }) => {
                  return (
                    <TxsInfiniteListItem
                      block={block}
                      hash={hash}
                      submitter={submitter}
                      type={type}
                      command={command}
                      code={code}
                    />
                  );
                }
              )}
            </tbody>
          </Table>
        </div>
      ) : loading ? (
        <Loader />
      ) : (
        <EmptyList
          heading={t('No transactions in this block')}
          label={t('0 transactions')}
        />
      )}
    </AsyncRenderer>
  );
};
