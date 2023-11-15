import { TxDetailsChainEventBuiltinDeposit } from './tx-builtin-deposit';
import { TxDetailsChainEventBuiltinWithdrawal } from './tx-builtin-withdrawal';
import { TxDetailsChainEventStakeDeposit } from './tx-stake-deposit';
import { TxDetailsChainEventStakeRemove } from './tx-stake-remove';
import { TxDetailsChainEventStakeTotalSupply } from './tx-stake-totalsupply';
import { TxDetailsChainMultisigThreshold } from './tx-multisig-threshold';
import { TxDetailsChainMultisigSigner } from './tx-multisig-signer';
import { TxDetailsChainEventErc20AssetList } from './tx-erc20-asset-list';
import { TxDetailsChainEventErc20AssetLimitsUpdated } from './tx-erc20-asset-limits-updated';
import { TxDetailsChainEventErc20BridgePause } from './tx-erc20-bridge-pause';
import { TxDetailsChainEventDeposit } from './tx-erc20-deposit';

import isUndefined from 'lodash/isUndefined';

import type { BlockExplorerTransactionResult } from '../../../../routes/types/block-explorer-response';
import { TxDetailsChainEventWithdrawal } from './tx-erc20-withdrawal';
import { TxDetailsChainEventErc20AssetDelist } from './tx-erc20-asset-delist';
import { TxDetailsContractCall } from './tx-contract-call';

interface ChainEventProps {
  txData: BlockExplorerTransactionResult | undefined;
}

/**
 * Inspects the chain event to determine which details view to show. The list of types
 * comes from the Swagger document that Block Explorer provides, which can be viewed at
 * https://docs.vega.xyz/testnet/api/rest/explorer/block-explorer-list-transactions
 *
 * This component should have one entry per chain event type, however if there isn't
 * a bespoke view for an event the tx-details-shared will still render some basic
 * overview and the transaction viewer will still let people view the raw TX.
 *
 * Most chain events simply render more table rows for the header table
 *
 * @returns React.JSXElement
 */
export const ChainEvent = ({ txData }: ChainEventProps) => {
  if (!txData?.command.chainEvent) {
    return null;
  }

  const { builtin, erc20, erc20Multisig, stakingEvent, contractCall } =
    txData.command.chainEvent;

  // Builtin Asset events
  if (builtin) {
    if (builtin.deposit) {
      return <TxDetailsChainEventBuiltinDeposit deposit={builtin.deposit} />;
    }

    if (builtin?.withdrawal) {
      return (
        <TxDetailsChainEventBuiltinWithdrawal
          withdrawal={builtin?.withdrawal}
        />
      );
    }
  }

  // ERC20 asset events
  if (erc20) {
    if (erc20.deposit) {
      return <TxDetailsChainEventDeposit deposit={erc20.deposit} />;
    }

    if (erc20.withdrawal) {
      return <TxDetailsChainEventWithdrawal withdrawal={erc20.withdrawal} />;
    }

    if (erc20.assetList) {
      return <TxDetailsChainEventErc20AssetList assetList={erc20.assetList} />;
    }

    if (erc20.assetDelist) {
      return (
        <TxDetailsChainEventErc20AssetDelist assetDelist={erc20.assetDelist} />
      );
    }

    if (erc20.assetLimitsUpdated) {
      return (
        <TxDetailsChainEventErc20AssetLimitsUpdated
          assetLimitsUpdated={erc20.assetLimitsUpdated}
        />
      );
    }

    const bridgeStopped = erc20.bridgeStopped;
    const bridgeResumed = erc20.bridgeResumed;
    if (!isUndefined(bridgeStopped) || !isUndefined(bridgeResumed)) {
      const isPaused = bridgeStopped === false || bridgeResumed === true;
      return <TxDetailsChainEventErc20BridgePause isPaused={isPaused} />;
    }
  }

  // ERC20 multisig events
  if (erc20Multisig) {
    if (erc20Multisig.thresholdSet) {
      return (
        <TxDetailsChainMultisigThreshold
          thresholdSet={erc20Multisig.thresholdSet}
        />
      );
    }

    if (erc20Multisig.signerAdded) {
      return (
        <TxDetailsChainMultisigSigner signer={erc20Multisig.signerAdded} />
      );
    }

    if (erc20Multisig.signerRemoved) {
      return (
        <TxDetailsChainMultisigSigner signer={erc20Multisig.signerRemoved} />
      );
    }
  }

  // Staking events
  if (stakingEvent) {
    if (stakingEvent.stakeDeposited) {
      return (
        <TxDetailsChainEventStakeDeposit
          deposit={stakingEvent.stakeDeposited}
        />
      );
    }

    if (stakingEvent.stakeRemoved) {
      return (
        <TxDetailsChainEventStakeRemove remove={stakingEvent.stakeRemoved} />
      );
    }

    if (stakingEvent.totalSupply) {
      return (
        <TxDetailsChainEventStakeTotalSupply
          update={stakingEvent.totalSupply}
        />
      );
    }
  }

  if (contractCall) {
    return <TxDetailsContractCall contractCall={contractCall} />;
  }

  // If we hit this return, tx-shared-details should give a basic overview
  return null;
};
