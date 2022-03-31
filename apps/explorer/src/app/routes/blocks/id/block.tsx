import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import type { TendermintBlocksResponse } from '../tendermint-blocks-response';
import { RouteTitle } from '../../../components/route-title';
import { SecondsAgo } from '../../../components/seconds-ago';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '../../../components/table';
import { TxsPerBlock } from '../../../components/txs/txs-per-block';
import { Button } from '@vegaprotocol/ui-toolkit';
import { Routes } from '../../router-config';
import { RenderFetched } from '../../../components/render-fetched';
import { t } from '@vegaprotocol/react-helpers';

const Block = () => {
  const { block } = useParams<{ block: string }>();
  const {
    state: { data: blockData, loading, error },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${block}`
  );

  const header = blockData?.result.block.header;
  if (!header) {
    return <p>{t('Could not get block data')}</p>;
  }

  return (
    <section>
      <RouteTitle data-testid="block-header">{t(`BLOCK ${block}`)}</RouteTitle>
      <RenderFetched error={error} loading={loading}>
        <>
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
                  className="text-vega-yellow font-mono"
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
          {blockData && blockData.result.block.data.txs.length > 0 ? (
            <TxsPerBlock blockHeight={block} />
          ) : null}
        </>
      </RenderFetched>
    </section>
  );
};

export { Block };
