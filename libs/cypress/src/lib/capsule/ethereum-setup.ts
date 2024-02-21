import { StakingBridge, Token } from '@vegaprotocol/smart-contracts';
import { createLog } from './logging';
import { promiseWithTimeout } from '../utils';
import { getVegaAsset } from './get-vega-asset';
import { getEthereumConfig } from './get-ethereum-config';
import { getPartyStake } from './get-party-stake';
import { wallet } from './ethereum-wallet';

const log = createLog('ethereum-setup');

export async function stakeForVegaPublicKey(
  vegaPublicKey: string,
  amount: string
) {
  if (!wallet) {
    throw new Error('ethereum wallet not initialized');
  }

  const vegaAsset = await getVegaAsset();
  if (!vegaAsset) {
    throw new Error('could not fetch asset');
  }

  const ethereumConfig = await getEthereumConfig();
  if (!ethereumConfig) {
    throw new Error('could not not fetch ethereum config');
  }

  const tokenContract = new Token(vegaAsset.source.contractAddress, wallet);

  log('sending approve tx');
  const approveTx = await promiseWithTimeout(
    tokenContract.approve(
      ethereumConfig.staking_bridge_contract.address,
      amount + '0'.repeat(19)
    ),
    10 * 60 * 1000,
    'approve staking tx'
  );

  await promiseWithTimeout(
    approveTx.wait(1),
    10 * 60 * 1000,
    'waiting for 1 stake approval confirmations'
  );
  log('sending approve tx: success');

  const stakingContract = new StakingBridge(
    ethereumConfig.staking_bridge_contract.address,
    wallet
  );

  const realAmount = amount + '0'.repeat(18);
  log(`sending stake tx of ${realAmount} to ${vegaPublicKey}`);
  const stakeTx = await promiseWithTimeout(
    stakingContract.stake(realAmount, vegaPublicKey),
    14000,
    'stakingContract.stake(realAmount, vegaPublicKey)'
  );
  await promiseWithTimeout(
    stakeTx.wait(3),
    10 * 60 * 1000,
    'waiting for 3 stake tx confirmations'
  );
  await waitForStake(vegaPublicKey);
  log(`sending stake tx: success`);
}

function waitForStake(vegaPublicKey: string) {
  return new Promise((resolve, reject) => {
    let tick = 1;
    const interval = setInterval(async () => {
      log(`confirming stake (attempt: ${tick})`);
      if (tick >= 90) {
        clearInterval(interval);
        reject(new Error('stake link never seen'));
      }

      try {
        const res = await getPartyStake(vegaPublicKey);

        if (
          res.party?.stakingSummary?.currentStakeAvailable !== null &&
          parseInt(res.party.stakingSummary.currentStakeAvailable) > 0
        ) {
          log(
            `stake confirmed (amount: ${res.party.stakingSummary.currentStakeAvailable})`
          );
          clearInterval(interval);
          resolve(res.party.stakingSummary.currentStakeAvailable);
        }
      } catch (err) {
        // no op, query will error until party is created
      }

      tick++;
    }, 1000);
  });
}
