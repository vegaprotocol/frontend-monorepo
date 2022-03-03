import { TendermintBlockchainResponse } from '../../../routes/blocks/tendermint-blockchain-response';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../../seconds-ago';
import { TxsPerBlock } from '../../txs/txs-per-block';
import { Table } from '../../table';

interface BlocksProps {
  data: TendermintBlockchainResponse | undefined;
  showTransactions?: boolean;
}

export const BlocksTable = ({ data, showTransactions }: BlocksProps) => {
  if (!data?.result) {
    return <>No block data</>;
  }

  return (
    <Table>
      {data.result?.block_metas?.map((block) => {
        return (
          <>
            <tr>
              <td>
                <Link to={`/blocks/${block.header?.height}`}>
                  {block.header?.height}
                </Link>
              </td>
              <td>
                {block.num_txs === '1'
                  ? '1 transaction'
                  : `${block.num_txs} transactions`}
              </td>
              <td>
                <Link to={`/validators/${block.header?.proposer_address}`}>
                  {block.header.proposer_address}
                </Link>
              </td>
              <td>
                <SecondsAgo date={block.header?.time} />
              </td>
            </tr>
            {showTransactions && (
              <tr>
                <TxsPerBlock blockHeight={block.header?.height} />
              </tr>
            )}
          </>
        );
      })}
    </Table>
  );
};
