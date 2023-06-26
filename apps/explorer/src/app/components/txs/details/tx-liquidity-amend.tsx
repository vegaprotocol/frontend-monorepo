import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { LiquidityProvisionDetails } from './liquidity-provision/liquidity-provision-details';
import PriceInMarket from '../../price-in-market/price-in-market';

export type LiquidityAmendment =
  components['schemas']['v1LiquidityProvisionAmendment'];

interface TxDetailsLiquidityAmendmentProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * An existing liquidity order is being amended. This uses
 * exactly the same details as the creation
 */
export const TxDetailsLiquidityAmendment = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsLiquidityAmendmentProps) => {
  if (!txData || !txData.command.liquidityProvisionAmendment) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const amendment: LiquidityAmendment =
    txData.command.liquidityProvisionAmendment;
  const marketId: string = amendment.marketId || '-';

  const fee = amendment.fee ? parseFloat(amendment.fee) * 100 : '-';

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
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
        {amendment.commitmentAmount ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Commitment amount')}</TableCell>
            <TableCell>
              <PriceInMarket
                price={amendment.commitmentAmount}
                marketId={marketId}
                decimalSource="SETTLEMENT_ASSET"
              />
            </TableCell>
          </TableRow>
        ) : null}
        {amendment.fee ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Fee')}</TableCell>
            <TableCell>{fee}%</TableCell>
          </TableRow>
        ) : null}
      </TableWithTbody>

      <LiquidityProvisionDetails provision={amendment} />
    </>
  );
};
