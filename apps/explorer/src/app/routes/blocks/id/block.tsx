import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlocksResponse } from '../tendermint-blocks-response';
import { RouteTitle } from '../../../components/route-title';
import { SecondsAgo } from '../../../components/seconds-ago';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '../../../components/table';
import { TxsPerBlock } from '../../../components/txs/txs-per-block';
import { Button, Loader } from '@vegaprotocol/ui-toolkit';
import { Routes } from '../../router-config';

const Block = () => {
  const { block } = useParams<{ block: string }>();

  const {
    state: { data: blockData, loading, error },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${block}`
  );

  const header = blockData?.result.block.header;

  if (loading) {
    return <Loader />;
  }

  if (!header || error) {
    return <>Could not get block data</>;
  }

  return (
    <section>
      <RouteTitle data-testid="block-header">BLOCK {block}</RouteTitle>
      <div className="grid grid-cols-2 gap-16">
        <Link
          data-testid="previous-block"
          to={`/${Routes.BLOCKS}/${Number(block) - 1}`}
        >
          <Button
            className="w-full"
            disabled={Number(block) === 1}
            variant="secondary"
          >
            Previous
          </Button>
        </Link>
        <Link
          data-testid="next-block"
          to={`/${Routes.BLOCKS}/${Number(block) + 1}`}
        >
          <Button className="w-full" variant="secondary">
            Next
          </Button>
        </Link>
      </div>
      <Table className="mb-28">
        <TableRow modifier="bordered">
          <TableHeader scope="row">Mined by</TableHeader>
          <TableCell modifier="bordered">
            <Link
              data-testid="block-validator"
              className="text-vega-yellow"
              to={`/${Routes.VALIDATORS}`}
            >
              {header.proposer_address}
            </Link>
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableHeader scope="row">Time</TableHeader>
          <TableCell modifier="bordered">
            <SecondsAgo data-testid="block-time" date={header.time} />
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
