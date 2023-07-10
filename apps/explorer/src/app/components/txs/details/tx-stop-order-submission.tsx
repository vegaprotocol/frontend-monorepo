import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import Hash from '../../links/hash';
import type { components } from '../../../../types/explorer';

interface TxDetailsOrderProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
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
  const marketId = tx.risesAbove?.orderSubmission?.marketId || '-';

  let deterministicId = '';

  const sig = txData?.signature?.value;
  if (sig) {
    deterministicId = txSignatureToDeterministicId(sig);
  }

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Order')}</TableCell>
        <TableCell>
          <Hash text={deterministicId} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Market ID')}</TableCell>
        <TableCell>
          <MarketLink id={marketId} showMarketName={false} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Market')}</TableCell>
        <TableCell>
          <MarketLink id={marketId} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
