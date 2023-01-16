import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { LiquidityProvisionDetails } from './liquidity-provision/liquidity-provision-details';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';

export type LiquiditySubmission =
  components['schemas']['v1LiquidityProvisionSubmission'];

interface TxDetailsLiquiditySubmissionProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Someone cancelled an order
 */
export const TxDetailsLiquiditySubmission = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsLiquiditySubmissionProps) => {
  if (!txData || !txData.command.liquidityProvisionSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const submission: LiquiditySubmission =
    txData.command.liquidityProvisionSubmission;
  const marketId: string = submission.marketId || '-';

  return (
    <>
      <TableWithTbody className="mb-8">
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} />
          </TableCell>
        </TableRow>
      </TableWithTbody>

      <LiquidityProvisionDetails provision={submission} />

      {/*      {orderId !== '-' ? <DeterministicOrderDetails id={orderId} /> : null} */}
    </>
  );
};
