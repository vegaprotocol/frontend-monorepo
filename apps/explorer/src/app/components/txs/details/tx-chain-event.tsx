import { t } from '@vegaprotocol/i18n';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';
import { ChainEvent } from './chain-events';

import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';

interface TxDetailsChainEventProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Chain events are external blockchain events (e.g. Ethereum) reported by bridge
 * Multiple events will relay the same data, from each validator, so that the
 * deposit/withdrawal can be verified independently.
 *
 * There are so many chain events that the specific components have been broken
 * out in to individual components. `getChainEventComponent` determines which
 * is the most appropriate based on the transaction shape. See that function
 * for more information.
 */
export const TxDetailsChainEvent = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsChainEventProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <ChainEvent txData={txData} />
    </TableWithTbody>
  );
};
