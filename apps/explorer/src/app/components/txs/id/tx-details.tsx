import { Link } from 'react-router-dom';
import { Routes } from '../../../routes/router-config';
import { Result } from '../../../routes/txs/tendermint-transaction-response.d';
import { Table } from '../../table';

interface TxDetailsProps {
  txData: Result | undefined;
  pubKey: string | undefined;
}

export const TxDetails = ({ txData, pubKey }: TxDetailsProps) => {
  if (!txData) {
    return <>Awaiting Tendermint transaction details</>;
  }

  return (
    <Table>
      <tr>
        <td>Hash</td>
        <td data-testid="hash">{txData.hash}</td>
      </tr>
      {pubKey ? (
        <tr>
          <td>Submitted by</td>
          <td data-testid="submitted-by">
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
          <td data-testid="block">
            <Link to={`/blocks/${txData.height}`}>{txData.height}</Link>
          </td>
        </tr>
      ) : null}
      <tr>
        <td>Encoded tnx</td>
        <td data-testid="encoded-tnx">{txData.tx}</td>
      </tr>
    </Table>
  );
};
