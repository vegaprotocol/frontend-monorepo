import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import PriceInMarket from '../../price-in-market/price-in-market';
import BigNumber from 'bignumber.js';

export type LiquiditySubmission =
  components['schemas']['v1LiquidityProvisionSubmission'];

interface TxDetailsLiquidityAmendmentProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * An existing liquidity order is being created.
 */
export const TxDetailsLiquiditySubmission = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsLiquidityAmendmentProps) => {
  if (!txData || !txData.command.liquidityProvisionSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const submission: LiquiditySubmission =
    txData.command.liquidityProvisionSubmission;
  const marketId: string = submission.marketId || '-';

  const fee = submission.fee
    ? new BigNumber(submission.fee).times(100).toString()
    : '-';

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Market')}</TableCell>
        <TableCell>
          <MarketLink id={marketId} />
        </TableCell>
      </TableRow>
      {submission.commitmentAmount ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Commitment amount')}</TableCell>
          <TableCell>
            <PriceInMarket
              price={submission.commitmentAmount}
              marketId={marketId}
              decimalSource="SETTLEMENT_ASSET"
            />
          </TableCell>
        </TableRow>
      ) : null}
      {submission.fee ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Fee')}</TableCell>
          <TableCell>{fee}%</TableCell>
        </TableRow>
      ) : null}
      {submission.reference ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Reference')}</TableCell>
          <TableCell>{submission.reference}</TableCell>
        </TableRow>
      ) : null}
    </TableWithTbody>
  );
};
