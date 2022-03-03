import React from 'react';
import { Link, useParams } from 'react-router-dom';
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

  const header = blockData?.result.block.header;

  if (!header) {
    return <>Could not get block data</>;
  }

  return (
    <section>
      <h1>BLOCK {block}</h1>
      <Table>
        <tr>
          <td>Mined by</td>
          <td>
            <Link to={`/validators/${header.proposer_address}`}>
              {header.proposer_address}
            </Link>
          </td>
        </tr>
        <tr>
          <td>Time</td>
          <td>
            <SecondsAgo date={header.time} />
          </td>
        </tr>
      </Table>
      <TxsPerBlock blockHeight={block} />
    </section>
  );
};

export { Block };
