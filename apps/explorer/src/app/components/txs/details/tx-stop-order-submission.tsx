import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { StopOrderSetup } from './order/stop-order-setup';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';

type StopOrderSetup = components['schemas']['v1StopOrderSetup'];

interface TxDetailsOrderProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

export function getStopTypeLabel(
  risesAbove: StopOrderSetup | undefined,
  fallsBelow: StopOrderSetup | undefined
): string {
  if (risesAbove && fallsBelow) {
    return t('OCO (One Cancels Other)');
  } else if (fallsBelow) {
    return t('Falls Below');
  } else if (risesAbove) {
    return t('Rises Above');
  } else {
    return t('Stop Order');
  }
}

export interface StopMarketIdProps {
  risesAbove: StopOrderSetup | undefined;
  fallsBelow: StopOrderSetup | undefined;
  showMarketName?: boolean;
}

export function StopMarketId({
  risesAbove,
  fallsBelow,
  showMarketName = false,
}: StopMarketIdProps) {
  const raMarketId = risesAbove?.orderSubmission?.marketId;
  const fbMarketId = fallsBelow?.orderSubmission?.marketId;

  if (raMarketId && fbMarketId) {
    if (raMarketId === fbMarketId) {
      return <MarketLink id={raMarketId} showMarketName={showMarketName} />;
    } else {
      return (
        <>
          <MarketLink id={raMarketId} showMarketName={showMarketName} />,
          <MarketLink id={fbMarketId} showMarketName={showMarketName} />
        </>
      );
    }
  } else if (raMarketId) {
    return <MarketLink id={raMarketId} showMarketName={showMarketName} />;
  } else if (fbMarketId) {
    return <MarketLink id={fbMarketId} showMarketName={showMarketName} />;
  } else {
    return '-';
  }
}

/**
 */
export const TxDetailsStopOrderSubmission = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsOrderProps) => {
  if (!txData || !txData.command.stopOrdersSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const tx: components['schemas']['v1StopOrdersSubmission'] =
    txData.command.stopOrdersSubmission;

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        {txData?.signature.value ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Deterministic ID')}</TableCell>
            <TableCell>
              {txSignatureToDeterministicId(txData.signature.value)}
            </TableCell>
          </TableRow>
        ) : null}
        <TableRow modifier="bordered">
          <TableCell>{t('Market ID')}</TableCell>
          <TableCell>
            <StopMarketId
              risesAbove={tx.risesAbove}
              fallsBelow={tx.fallsBelow}
            />
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <StopMarketId
              risesAbove={tx.risesAbove}
              fallsBelow={tx.fallsBelow}
              showMarketName={true}
            />
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Trigger')}</TableCell>
          <TableCell>
            {getStopTypeLabel(tx.risesAbove, tx.fallsBelow)}
          </TableCell>
        </TableRow>
      </TableWithTbody>
      {tx.risesAbove && (
        <StopOrderSetup type={'RisesAbove'} {...tx.risesAbove} />
      )}
      {tx.fallsBelow && (
        <StopOrderSetup type={'FallsBelow'} {...tx.fallsBelow} />
      )}
    </>
  );
};
