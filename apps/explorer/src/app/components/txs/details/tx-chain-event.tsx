import { t } from '@vegaprotocol/i18n';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';
import { defaultAbiCoder, base64 } from 'ethers/lib/utils';
import { ChainEvent } from './chain-events';
import { BigNumber } from 'ethers';

import type { AbiType } from '../../../lib/encoders/abis/abi-types';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';

interface AbiOutput {
  type: AbiType;
  internalType: AbiType;
  name: string;
}

/**
 * Decodes the b64/ABIcoded result from an eth cal
 * @param data
 * @returns
 */
export function decodeEthCallResult(
  data: BlockExplorerTransactionResult
): string {
  const ethResult = data.command.chainEvent?.contractCall.result;

  try {
    // Decode the result string: base64 => uint8array
    const data = base64.decode(ethResult);

    // Parse the escaped ABI in to an object
    const abi = JSON.parse(
      '[{"inputs":[],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"}]'
    );
    // Pull the expected types out of the Oracles ABI
    const types: AbiType[] = abi[0].outputs.map((o: AbiOutput) => o.type);

    const rawResult = defaultAbiCoder.decode(types, data);

    // Finally, convert the resulting BigNumber in to a string
    const res = BigNumber.from(rawResult[0]).toString();
    return res;
  } catch (e) {
    return '-';
  }
}

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
