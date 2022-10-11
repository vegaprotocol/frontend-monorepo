import { t } from '@vegaprotocol/react-helpers';
import { StatusMessage } from '../../../components/status-message';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import {
  TableWithTbody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/table';
import { TxOrderType } from '../../../components/txs';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';

interface TxContentProps {
  data: BlockExplorerTransactionResult | undefined;
}

export const TxContent = ({ data }: TxContentProps) => {
  if (!data?.command) {
    return (
      <StatusMessage>
        {t('Could not retrieve transaction content')}
      </StatusMessage>
    );
  }

  return (
    <>
      <TableWithTbody className="mb-12">
        <TableRow modifier="bordered">
          <TableHeader scope="row" className="w-[160px]">
            {t('Type')}
          </TableHeader>
          <TableCell modifier="bordered">
            <TxOrderType orderType={data.type} />
          </TableCell>
        </TableRow>
      </TableWithTbody>

      <h3 className="font-mono mb-8">{t('Decoded transaction content')}</h3>
      <SyntaxHighlighter data={data.command} />
    </>
  );
};
