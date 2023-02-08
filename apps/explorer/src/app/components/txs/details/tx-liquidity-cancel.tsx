import { t } from '@vegaprotocol/react-helpers';
import { MarketLink } from '../../links';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';

import type { components } from '../../../../types/explorer';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';

export type LiquidityCancellation =
  components['schemas']['v1LiquidityProvisionCancellation'];

interface TxDetailsLiquidityCancellationProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * An existing liquidity order is being cancelled - or attempted to be
 * cancelled. It may ot may not be actioned depending on the state of
 * the market at the time. Given the transaction is so basic, this view
 * simply adds a Market ID row to the header. When APIs support fetching
 * data at a tx or block height, we can populate this with accurate data
 */
export const TxDetailsLiquidityCancellation = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsLiquidityCancellationProps) => {
  if (!txData || !txData.command.liquidityProvisionCancellation) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cancel: LiquidityCancellation =
    txData.command.liquidityProvisionCancellation;
  const marketId: string = cancel.marketId || '-';

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Market')}</TableCell>
        <TableCell>
          <MarketLink id={marketId} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
