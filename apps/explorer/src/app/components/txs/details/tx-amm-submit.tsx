import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { ConcentratedLiquidityParametersDetails } from './amm/amm-liquidity-parameters';
import SizeInMarket from '../../size-in-market/size-in-market';

interface TxDetailsAMMSubmitProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

export type Submit = components['schemas']['v1SubmitAMM'];

/**
 * Create an AMM account for a user
 */
export const TxDetailsAMMSubmit = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsAMMSubmitProps) => {
  if (!txData || !txData.command.submitAmm) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const cmd: Submit = txData.command.submitAmm;
  const {
    marketId,
    commitmentAmount,
    proposedFee,
    slippageTolerance,
    concentratedLiquidityParameters,
  } = cmd;

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {marketId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} />
          </TableCell>
        </TableRow>
      )}
      {commitmentAmount && marketId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Amount')}</TableCell>
          <TableCell>
            <SizeInMarket
              marketId={marketId}
              size={commitmentAmount}
              decimalSource="ASSET"
              showAssetLabel={true}
            />
          </TableCell>
        </TableRow>
      )}

      {proposedFee && marketId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Proposed Fee')}</TableCell>
          <TableCell>{proposedFee}%</TableCell>
        </TableRow>
      )}

      {slippageTolerance && marketId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Slippage tolerance')}</TableCell>
          <TableCell>{slippageTolerance}%</TableCell>
        </TableRow>
      )}

      {concentratedLiquidityParameters && marketId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Liquidity parameters')}</TableCell>
          <TableCell>
            <ConcentratedLiquidityParametersDetails
              marketId={marketId}
              parameters={concentratedLiquidityParameters}
            />
          </TableCell>
        </TableRow>
      )}
    </TableWithTbody>
  );
};
