import React, { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';
import { TxDetailsChainEventDeposit } from './chain-events/tx-erc20-deposit';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsChainMultisigThreshold } from './chain-events/tx-erc20-threshold';
import { TxDetailsChainMultisigSigner } from './chain-events/tx-erc20-signer';

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
 * Design considerations so far:
 * - The ethereum address should be a link to an Ethereum explorer
 * - Sender and recipient are shown because they are easy
 * - Amount is not shown because there is no formatter by asset component
 */
export const TxDetailsChainEvent = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsChainEventProps) => {
  const child = useMemo(() => getChainEventComponent(txData), [txData]);

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <TableWithTbody>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {child}
    </TableWithTbody>
  );
};

function getChainEventComponent(txData?: BlockExplorerTransactionResult) {
  const deposit = txData?.command.chainEvent?.erc20?.deposit;
  if (deposit) {
    return <TxDetailsChainEventDeposit deposit={deposit} />;
  }

  const multisigEvent = txData?.command.chainEvent?.erc20Multisig;
  if (multisigEvent?.thresholdSet) {
    return <TxDetailsChainMultisigThreshold multisigEvent={multisigEvent} />;
  }

  const signerAdded = txData?.command.chainEvent?.erc20Multisig?.signerAdded;
  if (signerAdded) {
    return <TxDetailsChainMultisigSigner signer={signerAdded} />;
  }

  const signerRemoved =
    txData?.command.chainEvent?.erc20Multisig?.signerRemoved;
  if (signerRemoved) {
    return <TxDetailsChainMultisigSigner signer={signerRemoved} />;
  }

  return null;
}
