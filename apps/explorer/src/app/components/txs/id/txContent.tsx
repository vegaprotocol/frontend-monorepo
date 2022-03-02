import { Codeblock } from '../../codeblock';
import { ChainExplorerTxResponse } from '../../../routes/types/chain-explorer-response';

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
      <table>
        <tbody>
          <tr>
            <td>Type</td>
            <td>{data.Type}</td>
          </tr>
        </tbody>
      </table>

      <h3>Decoded transaction content</h3>
      <Codeblock code={displayCode} language={'javascript'} />
    </>
  );
};
