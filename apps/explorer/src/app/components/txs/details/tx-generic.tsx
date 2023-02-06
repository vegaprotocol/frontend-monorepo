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
 * A node is
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
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
    </TableWithTbody>
  );
};
