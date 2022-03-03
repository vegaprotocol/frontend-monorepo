import React from 'react';
import { useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlocksResponse } from '../tendermint-blocks-response';
import { TxsPerBlock } from '../../../components/txs/txs-per-block';
import { SecondsAgo } from '../../../components/seconds-ago';
import { Table } from '../../../components/table';

const Block = () => {
  const { block } = useParams<{ block: string }>();
  const {
    state: { data: blockData },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${block}`
  );

  return (
    <section>
      <h1>BLOCK {block}</h1>
      <Table>
        <tr>
          <td>Mined by</td>
          <td>{blockData?.result.block.header?.proposer_address}</td>
        </tr>
        <tr>
          <td>Time</td>
          <td>
            <SecondsAgo date={blockData?.result.block.header?.time} />
          </td>
        </tr>
      </Table>
      <TxsPerBlock blockHeight={block} />
    </section>
  );
};

export { Block };
