import { ChainExplorerTxResponse } from '../../../routes/types/chain-explorer-response';
import { Table } from '../../table';
import { SyntaxHighlighter } from '../../syntax-highlighter';

interface TxContentProps {
  data: ChainExplorerTxResponse | undefined;
}

export const TxContent = ({ data }: TxContentProps) => {
  if (!data?.Command) {
    return <>Awaiting decoded transaction data</>;
  }

  const { marketId, type, side, size } = JSON.parse(data.Command);

  const displayCode = {
    market: marketId,
    type,
    side,
    size,
  };

  return (
    <>
      <Table>
        <tr>
          <td>Type</td>
          <td>{data.Type}</td>
        </tr>
      </Table>

      <h3>Decoded transaction content</h3>
      <SyntaxHighlighter data={displayCode} />
    </>
  );
};
