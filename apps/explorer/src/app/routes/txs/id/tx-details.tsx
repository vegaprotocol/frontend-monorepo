import { Routes } from '../../route-names';
import { Button, CopyWithTooltip } from '@vegaprotocol/ui-toolkit';
import {
  TableWithTbody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/table';
import { TruncateInline } from '../../../components/truncate/truncate';
import { t } from '@vegaprotocol/react-helpers';
import { HighlightedLink } from '../../../components/highlighted-link';
import type { Result } from '../tendermint-transaction-response.d';

interface TxDetailsProps {
  txData: Result | undefined;
  pubKey: string | undefined;
  className?: string;
}

export const txDetailsTruncateLength = 30;

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
        <TableCell
          modifier="bordered"
          data-testid="encoded-tnx"
          className="flex justify-between"
        >
          <TruncateInline
            text={txData.tx}
            startChars={txDetailsTruncateLength}
            endChars={txDetailsTruncateLength}
          />
          <CopyWithTooltip text="">
            <Button
              variant="inline-link"
              prependIconName="duplicate"
              title={t('Copy tx to clipboard')}
              onClick={() => navigator.clipboard.writeText(txData.tx)}
              data-testid="copy-tx-to-clipboard"
            />
          </CopyWithTooltip>
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
