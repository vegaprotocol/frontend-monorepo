import { Codeblock } from '../../codeblock';
import { ChainExplorerTxResponse } from '../../../routes/types/chain-explorer-response';
import { Table } from '../../table';

interface TxContentProps {
  data: ChainExplorerTxResponse | undefined;
}

export const TxContent = ({ data }: TxContentProps) => {
  if (!data?.Command) {
    return <>Awaiting decoded transaction data</>;
  }

  const Command = JSON.parse(data.Command);

  const displayCode = `{
  "market": "${Command.marketId}",
  "type": "${Command.type}",
  "side": "${Command.side}",
  "size": "${Command.size}",
}`;

  return (
    <>
      <Table>
        <tr>
          <td>Type</td>
          <td>{data.Type}</td>
        </tr>
      </Table>

      <h3>Decoded transaction content</h3>
      <Codeblock code={displayCode} language={'javascript'} />
    </>
  );
};
