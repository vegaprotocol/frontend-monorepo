import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';
import type { TendermintBlocksResponse } from '../tendermint-blocks-response';
import { RouteTitle } from '../../../components/route-title';
import { TimeAgo } from '../../../components/time-ago';
import {
  TableWithTbody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../../components/table';
import { TxsPerBlock } from '../../../components/txs/txs-per-block';
import { Button } from '@vegaprotocol/ui-toolkit';
import { Routes } from '../../route-names';
import { RenderFetched } from '../../../components/render-fetched';
import { HighlightedLink } from '../../../components/highlighted-link';
import { t, useFetch } from '@vegaprotocol/react-helpers';

const Block = () => {
  const { block } = useParams<{ block: string }>();
  const {
    state: { data: blockData, loading, error },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${block}`
  );

  return (
    <section>
      <RouteTitle data-testid="block-header">{t(`BLOCK ${block}`)}</RouteTitle>
      <RenderFetched error={error} loading={loading}>
        <>
          <div className="grid grid-cols-2 gap-16 mb-24">
            <Link
              data-testid="previous-block"
              to={`/${Routes.BLOCKS}/${Number(block) - 1}`}
            >
              <Button
                data-testid="previous-block-button"
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
          {blockData && (
            <>
              <TableWithTbody className="mb-28">
                <TableRow modifier="bordered">
                  <TableHeader scope="row">Mined by</TableHeader>
                  <TableCell modifier="bordered">
                    <HighlightedLink
                      to={`/${Routes.VALIDATORS}`}
                      text={blockData.result.block.header.proposer_address}
                      data-testid="block-validator"
                    />
                  </TableCell>
                </TableRow>
                <TableRow modifier="bordered">
                  <TableHeader scope="row">Time</TableHeader>
                  <TableCell modifier="bordered">
                    <TimeAgo
                      data-testid="block-time"
                      date={blockData.result.block.header.time}
                    />{' '}
                    -{' '}
                    {getDateTimeFormat().format(
                      new Date(blockData.result.block.header.time)
                    )}
                  </TableCell>
                </TableRow>
              </TableWithTbody>
              {blockData.result.block.data.txs.length > 0 ? (
                <TxsPerBlock blockHeight={block} />
              ) : null}
            </>
          )}
        </>
      </RenderFetched>
    </section>
  );
};

export { Block };
