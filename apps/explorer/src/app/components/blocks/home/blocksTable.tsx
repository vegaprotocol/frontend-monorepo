import { TendermintBlockchainResponse } from '../../../routes/blocks/tendermint-blockchain-response';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../../seconds-ago';

interface BlocksProps {
  data: TendermintBlockchainResponse | undefined;
  showExpanded?: boolean;
}

export const BlocksTable = ({ data }: BlocksProps) => {
  if (!data?.result) {
    return <>Awaiting block data</>;
  }

  return (
    <table>
      <tbody>
        {data.result?.block_metas?.map((block) => {
          return (
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
              {block.header?.proposer_address && (
                <td>
                  <Link to={`/validators/${block.header.proposer_address}`}>
                    {block.header.proposer_address}
                  </Link>
                </td>
              )}
              <td>
                <SecondsAgo date={block.header?.time} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
