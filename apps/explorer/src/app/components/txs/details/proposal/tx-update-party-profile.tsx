import { t } from '@vegaprotocol/i18n';
import { TxDetailsShared } from '../shared/tx-details-shared';
import { TableWithTbody } from '../../../table';
import type { components } from '../../../../../types/explorer';

import type { BlockExplorerTransactionResult } from '../../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../../routes/blocks/tendermint-blocks-response';
import { TableCell, TableRow } from '../../../table';

type Update = components['schemas']['v1UpdatePartyProfile'];

interface TxDetailsUpdatePartyProfileProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Party profiles can be an alias and arbitrary key/values pairs.
 * This component displays the alias, if any, but not the metadata. When there is
 * some wider usage, we can decide how to render it. For now, it's available in the
 * full TX details.
 */
export const TxDetailsUpdatePartyProfile = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsUpdatePartyProfileProps) => {
  if (!txData?.command.updatePartyProfile) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const update: Update = txData.command.updatePartyProfile;

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {update.alias && (
        <TableRow modifier="bordered">
          <TableCell>{t('New alias')}</TableCell>
          <TableCell>{update.alias}</TableCell>
        </TableRow>
      )}
    </TableWithTbody>
  );
};
