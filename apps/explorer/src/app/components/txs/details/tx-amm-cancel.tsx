import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MarketLink } from '../../links/';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';

interface TxDetailsAMMCancelProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

export type Method = components['schemas']['v1CancelAMMMethod'];

export const MethodLabels: Record<Method, string> = {
  METHOD_UNSPECIFIED: 'Unspecified',
  METHOD_IMMEDIATE: 'Immediate',
  METHOD_REDUCE_ONLY: 'Reduce Only',
};

/**
 * Someone cancelled an order
 */
export const TxDetailsAMMCancel = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsAMMCancelProps) => {
  if (!txData || !txData.command.orderCancellation) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const marketId: string = txData.command.cancelAMM.marketId;
  const method: Method = txData.command.cancelAMM.method;

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {marketId ? (
        <TableRow modifier="bordered">
          <TableCell>{t('Market')}</TableCell>
          <TableCell>
            <MarketLink id={marketId} />
          </TableCell>
        </TableRow>
      ) : null}
      <TableRow modifier="bordered">
        <TableCell>{t('Method')}</TableCell>
        <TableCell>
          <code>{MethodLabels[method]}</code>
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
