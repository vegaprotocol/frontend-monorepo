import { Link } from 'react-router-dom';
import { Routes } from '../../../routes/router-config';
import { Result } from '../../../routes/txs/tendermint-transaction-response.d';

interface TxDetailsProps {
  txData: Result | undefined;
  pubKey: string | undefined;
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
