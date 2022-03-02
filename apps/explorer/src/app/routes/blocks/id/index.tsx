import React from 'react';
import { useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { ChainExplorerTxResponse } from '../../types/chain-explorer-response';
import { TendermintBlocksResponse } from '../tendermint-blocks-response';

const Block = () => {
  const { block } = useParams<{ block: string }>();
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
      block_height: parseInt(block!),
      node_url: `${DATA_SOURCES.tendermintUrl}/`,
    }),
  });

  const {
    state: { data: blockData },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${block}`
  );

  return (
    <section>
      <h1>block</h1>
      <h2>Tendermint Data</h2>
      <pre>{JSON.stringify(blockData, null, '  ')}</pre>
      <h2>Decoded data</h2>
      <pre>{JSON.stringify(decodedBlockData, null, '  ')}</pre>
    </section>
  );
};

export { Block };
