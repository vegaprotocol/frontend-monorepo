import { Link, useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import { getDateTimeFormat } from '@vegaprotocol/utils';
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
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { Routes } from '../../route-names';
import { t } from '@vegaprotocol/i18n';
import { useFetch } from '@vegaprotocol/react-helpers';
import { NodeLink } from '../../../components/links';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import EmptyList from '../../../components/empty-list/empty-list';

const Block = () => {
  const { block } = useParams<{ block: string }>();
  useDocumentTitle(['Blocks', `Block #${block}`]);
  const {
    state: { data: blockData, loading, error },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${block}`,
    { cache: 'force-cache' }
  );

  return (
    <section>
      <RouteTitle data-testid="block-header">{t(`BLOCK ${block}`)}</RouteTitle>
      <AsyncRenderer data={blockData} error={error} loading={!!loading}>
        <>
          <div className="grid grid-cols-2 gap-2 mb-8">
            <Link
              data-testid="previous-block"
              to={`/${Routes.BLOCKS}/${Number(block) - 1}`}
            >
              <Button
                data-testid="previous-block-button"
                fill={true}
                size="sm"
                disabled={Number(block) === 1}
              >
                Previous
              </Button>
            </Link>
            <Link
              data-testid="next-block"
              to={`/${Routes.BLOCKS}/${Number(block) + 1}`}
            >
              <Button size="sm" fill={true}>
                Next
              </Button>
            </Link>
          </div>
          {blockData && (
            <>
              <TableWithTbody className="mb-8">
                <TableRow modifier="bordered">
                  <TableHeader scope="row">{t('Block hash')}</TableHeader>
                  <TableCell modifier="bordered">
                    <code>{blockData.result.block_id.hash}</code>
                  </TableCell>
                </TableRow>
                <TableRow modifier="bordered">
                  <TableHeader scope="row">{t('Data hash')}</TableHeader>
                  <TableCell modifier="bordered">
                    <code>{blockData.result.block.header.data_hash}</code>
                  </TableCell>
                </TableRow>
                <TableRow modifier="bordered">
                  <TableHeader scope="row">{t('Consensus hash')}</TableHeader>
                  <TableCell modifier="bordered">
                    <code>{blockData.result.block.header.consensus_hash}</code>
                  </TableCell>
                </TableRow>
                <TableRow modifier="bordered">
                  <TableHeader scope="row">Mined by</TableHeader>
                  <TableCell modifier="bordered">
                    <NodeLink
                      id={blockData.result.block.header.proposer_address}
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
                <TableRow modifier="bordered">
                  <TableHeader scope="row">Transactions</TableHeader>
                  <TableCell modifier="bordered">
                    <span>{blockData.result.block.data.txs.length}</span>
                  </TableCell>
                </TableRow>
              </TableWithTbody>
              {blockData.result.block.data.txs.length > 0 ? (
                <TxsPerBlock
                  blockHeight={blockData.result.block.header.height}
                  txCount={blockData.result.block.data.txs.length}
                />
              ) : (
                <EmptyList
                  heading={t('This block is empty')}
                  label={t('0 transactions')}
                />
              )}
            </>
          )}
        </>
      </AsyncRenderer>
    </section>
  );
};

export { Block };
