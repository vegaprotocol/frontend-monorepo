import { Link } from 'react-router-dom';
import { Routes } from '../../routes/router-config';
import { Codeblock } from '../codeblock';
import { ChainExplorerTxResponse } from '../../routes/types/chain-explorer-response';
import { Result } from '../../routes/txs/tendermint-transaction-response.d';

interface TxDetailsProps {
  txData: Result | undefined;
  pubKey: string | undefined;
}

interface TxContentProps {
  data: ChainExplorerTxResponse | undefined;
}

export const TxDetails = ({ txData, pubKey }: TxDetailsProps) => {
  if (!txData) {
    return <>Awaiting Tendermint transaction details</>;
  }

  return (
    <table>
      <tbody>
        <tr>
          <td>Hash</td>
          <td>{txData.hash}</td>
        </tr>
        {pubKey ? (
          <tr>
            <td>Submitted by</td>
            <td>
              <Link to={`/${Routes.PARTIES}/${pubKey}`}>{pubKey}</Link>
            </td>
          </tr>
        ) : (
          <tr>
            <td>Submitted by</td>
            <td>Awaiting decoded transaction data</td>
          </tr>
        )}
        {txData.height ? (
          <tr>
            <td>Block</td>
            <td>{txData.height}</td>
          </tr>
        ) : null}
        <tr>
          <td>Encoded tnx</td>
          <td>{txData.tx}</td>
        </tr>
      </tbody>
    </table>
  );
};

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
