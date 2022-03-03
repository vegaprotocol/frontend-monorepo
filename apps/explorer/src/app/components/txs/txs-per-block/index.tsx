import useFetch from '../../../hooks/use-fetch';
import { ChainExplorerTxResponse } from '../../../routes/types/chain-explorer-response';
import { DATA_SOURCES } from '../../../config';

interface TxsPerBlockProps {
  blockHeight: string | undefined;
}

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
    <table>
      <thead>
        <tr>
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
                <td>{TxHash}</td>
                <td>{PubKey}</td>
                <td>{Type}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};
