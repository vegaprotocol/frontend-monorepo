import { ChainExplorerTxResponse } from '../../../routes/types/chain-explorer-response';
import { SyntaxHighlighter } from '../../syntax-highlighter';
import { Table, TableRow, TableHeader, TableCell } from '../../table';
import { TxOrderType } from '../tx-order-type';
import { StatusMessage } from '../../status-message';

interface TxContentProps {
  data: ChainExplorerTxResponse | undefined;
}

export const TxContent = ({ data }: TxContentProps) => {
  if (!data?.Command) {
    return (
      <StatusMessage>Could not retrieve transaction content</StatusMessage>
    );
  }

  return (
    <>
      <Table className="mb-12">
        <TableRow modifier="bordered">
          <TableHeader scope="row" className="w-[160px]">
            Type
          </TableHeader>
          <TableCell modifier="bordered">
            <TxOrderType orderType={data.Type} />
          </TableCell>
        </TableRow>
      </Table>

      {data.Command && (
        <>
          <h3 className="font-mono mb-8">Decoded transaction content</h3>
          <SyntaxHighlighter data={JSON.parse(data.Command)} />
        </>
      )}
    </>
  );
};
