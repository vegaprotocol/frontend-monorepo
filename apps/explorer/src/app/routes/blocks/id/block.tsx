import { Link, useParams } from 'react-router-dom';
import { getDateTimeFormat } from '@vegaprotocol/utils';
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
import { useBlockInfo } from '@vegaprotocol/tendermint';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import EmptyList from '../../../components/empty-list/empty-list';
import { useExplorerEpochForBlockQuery } from '../../../components/links/block-link/__generated__/EpochByBlock';
import EpochOverview from '../../../components/epoch-overview/epoch';
import { TendermintNodeLink } from '../../../components/links/node-link/tendermint-node-link';

type Params = { block: string };

const Block = () => {
  const { block } = useParams<Params>();
  useDocumentTitle(['Blocks', `Block #${block}`]);
  const {
    state: { data: blockData, loading, error },
  } = useBlockInfo(Number(block));

  const { data } = useExplorerEpochForBlockQuery({
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    variables: { block: block?.toString() || '' },
  });

  return (
    <section>
      <RouteTitle data-testid="block-header">{t(`BLOCK ${block}`)}</RouteTitle>
      <AsyncRenderer data={blockData} error={error} loading={!!loading}>
        <>
          <div className="mb-8 grid grid-cols-2 gap-2">
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
          {blockData && 'result' in blockData && (
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
                  <TableCell modifier="bordered" data-testid="block-validator">
                    <TendermintNodeLink
                      id={blockData.result.block.header.proposer_address}
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
                {data && data.epoch && (
                  <TableRow modifier="bordered">
                    <TableCell scope="row">{t('Epoch')}</TableCell>
                    <TableCell modifier="bordered">
                      <EpochOverview id={data.epoch.id} icon={false} />
                    </TableCell>
                  </TableRow>
                )}
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
