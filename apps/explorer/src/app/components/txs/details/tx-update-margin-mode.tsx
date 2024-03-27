import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { MarketLink } from '../../links';
import { Leverage } from '../../leverage/leverage';

interface TxDetailsUpdateMarginModeProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

type Mode = components['schemas']['UpdateMarginModeMode'];

const MarginModeLabels: Record<Mode, string> = {
  MODE_CROSS_MARGIN: t('Cross margin'),
  MODE_ISOLATED_MARGIN: t('Isolated margin'),
  MODE_UNSPECIFIED: t('Unspecified'),
};

export const TxDetailsUpdateMarginMode = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsUpdateMarginModeProps) => {
  if (!txData || !txData.command.updateMarginMode) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const u: components['schemas']['v1UpdateMarginMode'] =
    txData.command.updateMarginMode;

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {u.marketId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Market ID')}</TableCell>
          <TableCell>
            <MarketLink id={u.marketId} />
          </TableCell>
        </TableRow>
      )}
      {u.mode && (
        <TableRow modifier="bordered">
          <TableCell>{t('New margin mode')}</TableCell>
          <TableCell>{MarginModeLabels[u.mode]}</TableCell>
        </TableRow>
      )}
      {u.marginFactor && (
        <TableRow modifier="bordered">
          <TableCell>{t('Margin factor')}</TableCell>
          <TableCell>
            {u.marginFactor}
            <span className="mx-1">&mdash;</span>
            <Leverage marginFactor={u.marginFactor} />
            &nbsp;
            {t('leverage')}
          </TableCell>
        </TableRow>
      )}
    </TableWithTbody>
  );
};
