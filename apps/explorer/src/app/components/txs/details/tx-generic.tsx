import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';

interface TxDetailsGenericProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * If there is not yet a custom component for a transaction, just display
 * the basic details. This allows someone to view the decoded transaction.
 */
export const TxDetailsGeneric = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsGenericProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
    </TableWithTbody>
  );
};
