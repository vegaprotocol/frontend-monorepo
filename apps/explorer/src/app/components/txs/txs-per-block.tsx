import { Routes } from '../../routes/route-names';
import { DATA_SOURCES } from '../../config';
import { RenderFetched } from '../render-fetched';
import { TruncatedLink } from '../truncate/truncated-link';
import { TxOrderType } from './tx-order-type';
import { Table, TableRow, TableCell } from '../table';
import { t, useFetch } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactions } from '../../routes/types/block-explorer-response';
import isNumber from 'lodash/isNumber';
import { ChainResponseCode } from './details/chain-response-code/chain-reponse.code';
import { Loader } from '@vegaprotocol/ui-toolkit';
import EmptyList from '../empty-list/empty-list';

interface TxsPerBlockProps {
  blockHeight: string;
  txCount: number;
}

const truncateLength = 5;

export const TxsPerBlock = ({ blockHeight, txCount }: TxsPerBlockProps) => {
  // TODO after https://github.com/vegaprotocol/vega/pull/6958/files is merged and deployed, use filter
  // by block height instead
  const {
    state: { data, loading, error },
  } = useFetch<BlockExplorerTransactions>(
    `${
      DATA_SOURCES.blockExplorerUrl
    }/transactions?before=${blockHeight.toString()}.0&limit=${txCount}`
  );

  return (
    <RenderFetched error={error} loading={loading} className="text-body-large">
      {data && data.transactions.length > 0 ? (
        <div className="overflow-x-auto whitespace-nowrap mb-28">
          <Table>
            <thead>
              <TableRow modifier="bordered" className="font-mono">
                <td>{t('Transaction')}</td>
                <td>{t('From')}</td>
                <td>{t('Type')}</td>
                <td>{t('Status')}</td>
              </TableRow>
            </thead>
            <tbody>
              {data.transactions.map(
                ({ hash, submitter, type, command, code }) => {
                  return (
                    <TableRow
                      modifier="bordered"
                      key={hash}
                      data-testid="transaction-row"
                    >
                      <TableCell
                        modifier="bordered"
                        className="pr-12 font-mono"
                      >
                        <TruncatedLink
                          to={`/${Routes.TX}/${hash}`}
                          text={hash}
                          startChars={truncateLength}
                          endChars={truncateLength}
                        />
                      </TableCell>
                      <TableCell
                        modifier="bordered"
                        className="pr-12 font-mono"
                      >
                        <TruncatedLink
                          to={`/${Routes.PARTIES}/${submitter}`}
                          text={submitter}
                          startChars={truncateLength}
                          endChars={truncateLength}
                        />
                      </TableCell>
                      <TableCell modifier="bordered">
                        <TxOrderType orderType={type} command={command} />
                      </TableCell>
                      <TableCell modifier="bordered" className="text">
                        {isNumber(code) ? (
                          <ChainResponseCode code={code} hideLabel={true} />
                        ) : (
                          code
                        )}
                      </TableCell>
                    </TableRow>
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
          heading={t('This block is empty')}
          label={t('0 transactions')}
        />
      )}
    </RenderFetched>
  );
};
