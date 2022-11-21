import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type {
  AmendLiquidityProvisionOrder,
  BlockExplorerTransactionResult,
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
 * Specifies changes to the shape of a users Liquidity Commitment order for
 * a specific market. So far this only displays the market, which is only
 * because it's very easy to do so.
 */
export const TxDetailsLPAmend = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cmd = txData.command as AmendLiquidityProvisionOrder;

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Market')}</TableCell>
        <TableCell>
          <MarketLink id={cmd.liquidityProvisionAmendment.marketId} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
