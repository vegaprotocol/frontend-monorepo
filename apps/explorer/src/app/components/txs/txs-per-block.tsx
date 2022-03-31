import useFetch from '../../hooks/use-fetch';
import type { ChainExplorerTxResponse } from '../../routes/types/chain-explorer-response';
import { Routes } from '../../routes/router-config';
import { DATA_SOURCES } from '../../config';
import { Link } from 'react-router-dom';
import { RenderFetched } from '../render-fetched';
import { TruncateInline } from '../truncate/truncate';
import { TxOrderType } from './tx-order-type';
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
          <table className="w-full">
            <thead>
              <tr className="font-mono">
                <td>{t('Transaction')}</td>
                <td>{t('From')}</td>
                <td>{t('Type')}</td>
              </tr>
            </thead>
            <tbody>
              {decodedBlockData.map(({ TxHash, PubKey, Type }) => {
                return (
                  <tr key={TxHash} data-testid="transaction-row">
                    <td>
                      <Link to={`/${Routes.TX}/${TxHash}`}>
                        <TruncateInline
                          text={TxHash}
                          startChars={truncateLength}
                          endChars={truncateLength}
                          className="text-vega-yellow font-mono"
                        />
                      </Link>
                    </td>
                    <td>
                      <Link to={`/${Routes.PARTIES}/${PubKey}`}>
                        <TruncateInline
                          text={PubKey}
                          startChars={truncateLength}
                          endChars={truncateLength}
                          className="text-vega-yellow font-mono"
                        />
                      </Link>
                    </td>
                    <td>
                      <TxOrderType className="mb-4" orderType={Type} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="font-mono mb-28">
          {t(`No transactions in block ${blockHeight}`)}
        </div>
      )}
    </RenderFetched>
  );
};
