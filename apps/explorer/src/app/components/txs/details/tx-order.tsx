import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type {
  BlockExplorerTransactionResult,
  SubmitOrder,
} from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';

interface TxDetailsOrderProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * An order type is probably the most interesting type we'll see! Except until:
 * https://github.com/vegaprotocol/vega/issues/6832 is complete, we can only
 * fetch the actual transaction and not more details about the order. So for now
 * this view is very basic
 */
export const TxDetailsOrder = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cmd = txData.command as SubmitOrder;

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Market')}</TableCell>
        <TableCell>
          <MarketLink id={cmd.orderSubmission.marketId} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
