import React, { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';
import { TxDetailsChainEventDeposit } from './chain-events/tx-erc20-deposit';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsChainMultisigThreshold } from './chain-events/tx-multisig-threshold';
import { TxDetailsChainMultisigSigner } from './chain-events/tx-multisig-signer';
import { TxDetailsChainEventBuiltinDeposit } from './chain-events/tx-builtin-deposit';
import { TxDetailsChainEventStakeDeposit } from './chain-events/tx-stake-deposit';
import { TxDetailsChainEventStakeRemove } from './chain-events/tx-stake-remove';
import { TxDetailsChainEventStakeTotalSupply } from './chain-events/tx-stake-totalsupply';
import { TxDetailsChainEventBuiltinWithdrawal } from './chain-events/tx-builtin-withdrawal';

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

// TODO: extract
function getChainEventComponent(txData?: BlockExplorerTransactionResult) {
  // Builtin Asset events
  const internalDeposit = txData?.command.chainEvent?.builtin?.deposit;
  if (internalDeposit) {
    return <TxDetailsChainEventBuiltinDeposit deposit={internalDeposit} />;
  }

  const internalWithdrawal = txData?.command.chainEvent?.builtin?.withdrawal;
  if (internalWithdrawal) {
    return (
      <TxDetailsChainEventBuiltinWithdrawal withdrawal={internalWithdrawal} />
    );
  }

  // ERC20 asset events
  const deposit = txData?.command.chainEvent?.erc20?.deposit;
  if (deposit) {
    return <TxDetailsChainEventDeposit deposit={deposit} />;
  }

  const withdrawal = txData?.command.chainEvent?.erc20?.withdrawal;
  if (withdrawal) {
    return <TxDetailsChainEventBuiltinWithdrawal withdrawal={withdrawal} />;
  }

  // ERC20 multisig events
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

  // Staking events
  const stakeDeposited =
    txData?.command.chainEvent?.stakingEvent?.stakeDeposited;
  if (stakeDeposited) {
    return <TxDetailsChainEventStakeDeposit deposit={stakeDeposited} />;
  }

  const stakeRemoved = txData?.command.chainEvent?.stakingEvent?.stakeRemoved;
  if (stakeRemoved) {
    return <TxDetailsChainEventStakeRemove remove={stakeRemoved} />;
  }

  const stakeTotalSupply =
    txData?.command.chainEvent?.stakingEvent?.totalSupply;
  if (stakeTotalSupply) {
    return <TxDetailsChainEventStakeTotalSupply update={stakeTotalSupply} />;
  }

  return null;
}
