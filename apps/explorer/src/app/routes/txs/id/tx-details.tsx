import { Routes } from '../../route-names';
import { CopyWithTooltip, Icon } from '@vegaprotocol/ui-toolkit';
import {
  TableWithTbody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/table';
import { t } from '@vegaprotocol/react-helpers';
import { HighlightedLink } from '../../../components/highlighted-link';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import React from 'react';

interface TxDetailsProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  className?: string;
}

export const txDetailsTruncateLength = 30;

export const TxDetails = ({ txData, pubKey, className }: TxDetailsProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <TableWithTbody className={className}>
      <TableRow modifier="bordered">
        <TableCell>{t('Hash')}</TableCell>
        <TableCell modifier="bordered" data-testid="hash">
          {txData.hash}
          <CopyWithTooltip text={txData.hash}>
            <button
              title={t('Copy tx to clipboard')}
              data-testid="copy-tx-to-clipboard"
              className="underline"
            >
              <Icon name="duplicate" className="ml-2" />
            </button>
          </CopyWithTooltip>
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
            to={`/${Routes.BLOCKS}/${txData.block}`}
            text={txData.block}
          />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
