import { TxDetailsChainMultisigThreshold } from './tx-multisig-threshold';
import { TxDetailsChainMultisigSigner } from './tx-multisig-signer';
import { TxDetailsChainEventBuiltinDeposit } from './tx-builtin-deposit';
import { TxDetailsChainEventStakeDeposit } from './tx-stake-deposit';
import { TxDetailsChainEventStakeRemove } from './tx-stake-remove';
import { TxDetailsChainEventStakeTotalSupply } from './tx-stake-totalsupply';
import { TxDetailsChainEventBuiltinWithdrawal } from './tx-builtin-withdrawal';
import { TxDetailsChainEventErc20AssetList } from './tx-erc20-asset-list';
import { TxDetailsChainEventErc20AssetLimitsUpdated } from './tx-erc20-asset-limits-updated';
import { TxDetailsChainEventErc20BridgePause } from './tx-erc20-bridge-pause';
import { TxDetailsChainEventDeposit } from './tx-erc20-deposit';

import isUndefined from 'lodash/isUndefined';

import type { BlockExplorerTransactionResult } from '../../../../routes/types/block-explorer-response';

/**
 * Inspects the chain event to determine which details view to show. The list of types
 * comes from the Swagger document that Block Explorer provides, which can be viewed at
 * https://docs.vega.xyz/testnet/api/rest/explorer/block-explorer-list-transactions
 *
 * This component *should* have one entry per chain event type, and new chain events
 * will need to be added manually.
 *
 * Most chain events simply render more table rows for the header table
 *
 * @returns React.JSXElement
 */
export function getChainEventComponent(
  txData?: BlockExplorerTransactionResult
) {
  const e = txData?.command.chainEvent;
  if (!e) {
    return null;
  }

  // Builtin Asset events
  if (e.builtin) {
    if (e.builtin.deposit) {
      return <TxDetailsChainEventBuiltinDeposit deposit={e.builtin.deposit} />;
    }

    if (e.builtin?.withdrawal) {
      return (
        <TxDetailsChainEventBuiltinWithdrawal
          withdrawal={e.builtin?.withdrawal}
        />
      );
    }
  }

  // ERC20 asset events
  if (e.erc20) {
    if (e.erc20.deposit) {
      return <TxDetailsChainEventDeposit deposit={e.erc20.deposit} />;
    }

    if (e.erc20.withdrawal) {
      return (
        <TxDetailsChainEventBuiltinWithdrawal withdrawal={e.erc20.withdrawal} />
      );
    }

    if (e.erc20.assetList) {
      return (
        <TxDetailsChainEventErc20AssetList assetList={e.erc20.assetList} />
      );
    }

    if (e.erc20.assetLimitsUpdated) {
      return (
        <TxDetailsChainEventErc20AssetLimitsUpdated
          assetLimitsUpdated={e.erc20.assetLimitsUpdated}
        />
      );
    }

    const bridgeStopped = e.erc20.bridgeStopped;
    const bridgeResumed = e.erc20.bridgeResumed;
    if (!isUndefined(bridgeStopped) || !isUndefined(bridgeResumed)) {
      const isPaused = bridgeStopped === false || bridgeResumed === true;
      return <TxDetailsChainEventErc20BridgePause isPaused={isPaused} />;
    }
  }

  // ERC20 multisig events
  if (e.erc20Multisig) {
    if (e.erc20Multisig.thresholdSet) {
      return (
        <TxDetailsChainMultisigThreshold
          thresholdSet={e.erc20Multisig.thresholdSet}
        />
      );
    }

    if (e.erc20Multisig.signerAdded) {
      return (
        <TxDetailsChainMultisigSigner signer={e.erc20Multisig.signerAdded} />
      );
    }

    if (e.erc20Multisig.signerRemoved) {
      return (
        <TxDetailsChainMultisigSigner signer={e.erc20Multisig.signerRemoved} />
      );
    }
  }

  // Staking events
  if (e.stakingEvent) {
    if (e.stakingEvent.stakeDeposited) {
      return (
        <TxDetailsChainEventStakeDeposit
          deposit={e.stakingEvent.stakeDeposited}
        />
      );
    }

    if (e.stakingEvent.stakeRemoved) {
      return (
        <TxDetailsChainEventStakeRemove remove={e.stakingEvent.stakeRemoved} />
      );
    }

    if (e.stakingEvent.totalSupply) {
      return (
        <TxDetailsChainEventStakeTotalSupply
          update={e.stakingEvent.totalSupply}
        />
      );
    }
  }

  // If we hit this return, tx-shared-details should give a basic overview
  return null;
}
