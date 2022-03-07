import useFetch from '../../../hooks/use-fetch';
import { ChainExplorerTxResponse } from '../../../routes/types/chain-explorer-response';
import { DATA_SOURCES } from '../../../config';
import { Link } from 'react-router-dom';
import { TruncateInline } from '../../truncate/truncate';

interface TxsPerBlockProps {
  blockHeight: string | undefined;
}

const truncateLength = 14;

export const TxsPerBlock = ({ blockHeight }: TxsPerBlockProps) => {
  const {
    state: { data: decodedBlockData },
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
    <div className="overflow-x-auto whitespace-nowrap mb-28">
      <table className="w-full">
        <thead>
          <tr className="font-mono">
            <td>Transaction</td>
            <td>From</td>
            <td>Type</td>
          </tr>
        </thead>
        <tbody>
          {decodedBlockData &&
            decodedBlockData.map(({ TxHash, PubKey, Type }, index) => {
              return (
                <tr key={index}>
                  <td>
                    <Link to={`/txs/${TxHash}`}>
                      <TruncateInline
                        text={TxHash}
                        startChars={truncateLength}
                        endChars={truncateLength}
                        className="text-vega-yellow font-mono"
                      />
                    </Link>
                  </td>
                  <td>
                    <TruncateInline
                      text={PubKey}
                      startChars={truncateLength}
                      endChars={truncateLength}
                      className="font-mono"
                    />
                  </td>
                  <td>{Type}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
