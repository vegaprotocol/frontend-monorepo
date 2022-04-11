import useFetch from '../../hooks/use-fetch';
import type { ChainExplorerTxResponse } from '../../routes/types/chain-explorer-response';
import { Routes } from '../../routes/route-names';
import { DATA_SOURCES } from '../../config';
import { RenderFetched } from '../render-fetched';
import { TruncatedLink } from '../truncate/truncated-link';
import { TxOrderType } from './tx-order-type';
import { Table, TableRow, TableCell } from '../table';
import { t } from '@vegaprotocol/react-helpers';

interface TxsPerBlockProps {
  blockHeight: string | undefined;
}

const truncateLength = 14;

export const TxsPerBlock = ({ blockHeight }: TxsPerBlockProps) => {
  const {
    state: { data: decodedBlockData, loading, error },
  } = useFetch<ChainExplorerTxResponse[]>(DATA_SOURCES.chainExplorerUrl, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      block_height: parseInt(blockHeight!),
      node_url: `${DATA_SOURCES.tendermintUrl}/`,
    }),
  });

  return (
    <RenderFetched error={error} loading={loading} className="text-body-large">
      {decodedBlockData && decodedBlockData.length ? (
        <div className="overflow-x-auto whitespace-nowrap mb-28">
          <Table>
            <thead>
              <TableRow modifier="bordered" className="font-mono">
                <td>{t('Transaction')}</td>
                <td>{t('From')}</td>
                <td>{t('Type')}</td>
              </TableRow>
            </thead>
            <tbody>
              {decodedBlockData.map(({ TxHash, PubKey, Type }) => {
                return (
                  <TableRow
                    modifier="bordered"
                    key={TxHash}
                    data-testid="transaction-row"
                  >
                    <TableCell modifier="bordered" className="pr-12">
                      <TruncatedLink
                        to={`/${Routes.TX}/${TxHash}`}
                        text={TxHash}
                        startChars={truncateLength}
                        endChars={truncateLength}
                      />
                    </TableCell>
                    <TableCell modifier="bordered" className="pr-12">
                      <TruncatedLink
                        to={`/${Routes.PARTIES}/${PubKey}`}
                        text={PubKey}
                        startChars={truncateLength}
                        endChars={truncateLength}
                      />
                    </TableCell>
                    <TableCell modifier="bordered">
                      <TxOrderType orderType={Type} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="font-mono mb-28">
          {t(`No transactions in block ${blockHeight}`)}
        </div>
      )}
    </RenderFetched>
  );
};
