import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlocksResponse } from '../tendermint-blocks-response';
import { RouteTitle } from '../../../components/route-title';
import { TxsPerBlock } from '../../../components/txs/txs-per-block';
import { SecondsAgo } from '../../../components/seconds-ago';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '../../../components/table';

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
      <RouteTitle>BLOCK {block}</RouteTitle>
      <Table className="mb-28">
        <TableRow modifier="bordered">
          <TableHeader scope="row">Mined by</TableHeader>
          <TableCell modifier="bordered">
            <Link
              className="text-vega-yellow"
              to={`/validators/${header.proposer_address}`}
            >
              {header.proposer_address}
            </Link>
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableHeader scope="row">Time</TableHeader>
          <TableCell modifier="bordered">
            <SecondsAgo date={header.time} />
          </TableCell>
        </TableRow>
      </Table>
      {blockData?.result.block.data.txs.length > 0 && (
        <TxsPerBlock blockHeight={block} />
      )}
    </section>
  );
};

export { Block };
