import { Routes } from '../../router-config';
import type { Result } from '../tendermint-transaction-response.d';
import {
  TableWithTbody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/table';
import { TruncateInline } from '../../../components/truncate/truncate';
import { t } from '@vegaprotocol/react-helpers';

import { HighlightedLink } from '../../../components/highlighted-link';
interface TxDetailsProps {
  txData: Result | undefined;
  pubKey: string | undefined;
  className?: string;
}

const truncateLength = 30;

export const TxDetails = ({ txData, pubKey, className }: TxDetailsProps) => {
  if (!txData) {
    return <>{t('Awaiting Tendermint transaction details')}</>;
  }

  return (
    <TableWithTbody className={className}>
      <TableRow modifier="bordered">
        <TableCell>{t('Hash')}</TableCell>
        <TableCell modifier="bordered" data-testid="hash">
          {txData.hash}
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableHeader scope="row" className="w-[160px]">
          {t('Submitted by')}
        </TableHeader>
        <TableCell modifier="bordered" data-testid="submitted-by">
          <HighlightedLink to={`/${Routes.PARTIES}/${pubKey}`} text={pubKey} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Block')}</TableCell>
        <TableCell modifier="bordered" data-testid="block">
          <HighlightedLink
            to={`/${Routes.BLOCKS}/${txData.height}`}
            text={txData.height}
          />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Encoded txn')}</TableCell>
        <TableCell modifier="bordered" data-testid="encoded-tnx">
          <TruncateInline
            text={txData.tx}
            startChars={truncateLength}
            endChars={truncateLength}
          />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
