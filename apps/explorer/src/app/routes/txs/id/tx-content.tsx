import { StatusMessage } from '../../../components/status-message';
import { SyntaxHighlighter } from '../../../components/syntax-highlighter';
import {
  TableWithTbody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/table';
import { TxOrderType } from '../../../components/txs';
import { ChainExplorerTxResponse } from '../../types/chain-explorer-response';

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
      <TableWithTbody className="mb-12">
        <TableRow modifier="bordered">
          <TableHeader scope="row" className="w-[160px]">
            Type
          </TableHeader>
          <TableCell modifier="bordered">
            <TxOrderType orderType={data.Type} />
          </TableCell>
        </TableRow>
      </TableWithTbody>

      <h3 className="font-mono mb-8">Decoded transaction content</h3>
      <SyntaxHighlighter data={JSON.parse(data.Command)} />
    </>
  );
};
