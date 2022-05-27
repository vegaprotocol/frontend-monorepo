import type { BigNumber as EthersBigNumber } from 'ethers';
import { ethers } from 'ethers';
import stakingAbi from '../abis/staking_abi.json';
import tokenAbi from '../abis/vega_token_abi.json';
import { combineStakeEventsByVegaKey } from './stake-helpers';
import BigNumber from 'bignumber.js';
import { BaseContract } from './base-contract';
import { EnvironmentConfig } from '../config/ethereum';
import type { Networks } from '../config/vega';
import { addDecimal, hexadecimalify, removeDecimal } from '../utils';

export class VegaStaking extends BaseContract {
  public contract: ethers.Contract;
  public tokenContract: ethers.Contract;
  public dp: Promise<number>;

  constructor(
    network: Networks,
    provider: ethers.providers.Web3Provider,
    signer?: ethers.Signer
  ) {
    super(provider, signer);

    const tokenContract = new ethers.Contract(
      EnvironmentConfig[network].vegaTokenAddress,
      tokenAbi,
      this.signer || this.provider
    );
    this.tokenContract = tokenContract;

    this.contract = new ethers.Contract(
      EnvironmentConfig[network].stakingBridge,
      stakingAbi,
      this.signer || this.provider
    );

    this.dp = (async () => {
      const val = await tokenContract.decimals();
      return Number(val);
    })();
  }

  /** Executes staking contracts stake function */
  async addStake(
    amount: BigNumber,
    vegaKey: string,
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const convertedAmount = removeDecimal(amount, await this.dp).toString();

    const tx = await this.contract.stake(
      convertedAmount,
      hexadecimalify(vegaKey)
    );

    // store and track the transaction in BaseContract
    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /** Executes staking contracts remove_stake function */
  async removeStake(
    amount: BigNumber,
    vegaKey: string,
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const convertedAmount = removeDecimal(amount, await this.dp).toString();

    const tx = await this.contract.remove_stake(
      convertedAmount,
      hexadecimalify(vegaKey)
    );

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /** Executes staking contracts transfer_stake function */
  async transferStake(
    amount: BigNumber,
    newAddress: string,
    vegaKey: string,
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const convertedAmount = removeDecimal(amount, await this.dp).toString();

    const tx = await this.contract.transfer_stake(
      convertedAmount,
      newAddress,
      hexadecimalify(vegaKey)
    );

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /** Returns the amount staked for given Vega public key */
  async stakeBalance(address: string, vegaKey: string): Promise<BigNumber> {
    const res: EthersBigNumber = await this.contract.stake_balance(
      address,
      hexadecimalify(vegaKey)
    );
    const value = addDecimal(new BigNumber(res.toString()), await this.dp);
    return value;
  }

  /** Returns the total amount currently staked */
  async totalStaked(): Promise<BigNumber> {
    const res: EthersBigNumber = await this.contract.total_staked();
    const value = addDecimal(new BigNumber(res.toString()), await this.dp);
    return value;
  }

  /** Returns amounts staked across all Vega keys for single Ethereum account */
  async userTotalStakedByVegaKey(
    ethereumAccount: string
  ): Promise<{ [vegaKey: string]: BigNumber }> {
    const addFilter = this.contract.filters.Stake_Deposited(ethereumAccount);
    const removeFilter = this.contract.filters.Stake_Removed(ethereumAccount);
    const addEvents = await this.contract.queryFilter(addFilter);
    const removeEvents = await this.contract.queryFilter(removeFilter);
    const res = combineStakeEventsByVegaKey(
      [...addEvents, ...removeEvents],
      await this.dp
    );
    return res;
  }
}
