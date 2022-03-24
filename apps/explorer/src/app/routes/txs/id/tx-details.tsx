import { Link } from 'react-router-dom';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/table';
import { TruncateInline } from '../../../components/truncate/truncate';
import { Routes } from '../../../routes/router-config';
import { Result } from '../../../routes/txs/tendermint-transaction-response.d';

interface TxDetailsProps {
  txData: Result | undefined;
  pubKey: string | undefined;
  className?: string;
}

const truncateLength = 30;

export const TxDetails = ({ txData, pubKey, className }: TxDetailsProps) => {
  if (!txData) {
    return <>Awaiting Tendermint transaction details</>;
  }

  return (
    <Table className={className}>
      <TableRow modifier="bordered">
        <TableCell>Hash</TableCell>
        <TableCell modifier="bordered" data-testid="hash">
          {txData.hash}
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableHeader scope="row" className="w-[160px]">
          Submitted by
        </TableHeader>
        <TableCell modifier="bordered" data-testid="submitted-by">
          <Link
            className="text-vega-yellow"
            to={`/${Routes.PARTIES}/${pubKey}`}
          >
            {pubKey}
          </Link>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>Block</TableCell>
        <TableCell modifier="bordered" data-testid="block">
          <Link
            className="text-vega-yellow"
            to={`/${Routes.BLOCKS}/${txData.height}`}
          >
            {txData.height}
          </Link>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>Encoded txn</TableCell>
        <TableCell modifier="bordered" data-testid="encoded-tnx">
          <TruncateInline
            text={txData.tx}
            startChars={truncateLength}
            endChars={truncateLength}
          />
        </TableCell>
      </TableRow>
    </Table>
  );
};
