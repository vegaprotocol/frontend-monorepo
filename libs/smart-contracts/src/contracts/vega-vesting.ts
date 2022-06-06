import BigNumber from 'bignumber.js';
import type { BigNumber as EthersBigNumber } from 'ethers';
import { ethers } from 'ethers';
import { EnvironmentConfig } from '../config/ethereum';
import type { Networks } from '../config/vega';
import vestingAbi from '../abis/vesting_abi.json';
import tokenAbi from '../abis/vega_token_abi.json';
import { BaseContract } from './base-contract';
import { combineStakeEventsByVegaKey } from './stake-helpers';
import { getTranchesFromHistory } from './tranche-helpers';
import type { Tranche } from './vega-web3-types';
import { addDecimal, hexadecimalify, removeDecimal } from '../utils';

export class VegaVesting extends BaseContract {
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
      EnvironmentConfig[network].vestingAddress,
      vestingAbi,
      this.signer || this.provider
    );

    this.dp = (async () => {
      const val = await tokenContract.decimals();
      return Number(val);
    })();
  }

  /** Executes vesting contracts stake_tokens function */
  async addStake(
    amount: BigNumber,
    vegaKey: string,
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const convertedAmount = removeDecimal(amount, await this.dp).toString();

    const tx = await this.contract.stake_tokens(
      convertedAmount,
      hexadecimalify(vegaKey)
    );

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /** Executes vesting contracts remove_stake function */
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

  /** Returns the amount staked for a given Vega public key */
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

  /** Returns the amount of locked tokens in the vesting contract */
  async getLien(address: string): Promise<BigNumber> {
    const {
      lien,
    }: {
      lien: EthersBigNumber;
      total_in_all_tranches: EthersBigNumber;
    } = await this.contract.user_stats(address);
    const value = addDecimal(new BigNumber(lien.toString()), await this.dp);
    return value;
  }

  /** Returns the amount a user has in a specific tranche */
  async userTrancheTotalBalance(
    address: string,
    tranche: number
  ): Promise<BigNumber> {
    const amount: EthersBigNumber = await this.contract.get_tranche_balance(
      address,
      tranche
    );
    const value = addDecimal(new BigNumber(amount.toString()), await this.dp);
    return value;
  }

  /** Returns vested amount for a given tranche */
  async userTrancheVestedBalance(
    address: string,
    tranche: number
  ): Promise<BigNumber> {
    const amount: EthersBigNumber = await this.contract.get_vested_for_tranche(
      address,
      tranche
    );
    const value = addDecimal(new BigNumber(amount.toString()), await this.dp);
    return value;
  }

  /** Returns the users total tokens across all tranches */
  async getUserBalanceAllTranches(account: string): Promise<BigNumber> {
    const amount: EthersBigNumber = await this.contract.user_total_all_tranches(
      account
    );
    const value = addDecimal(new BigNumber(amount.toString()), await this.dp);
    return value;
  }

  /** Gets all tranche data */
  async getAllTranches(): Promise<Tranche[]> {
    const [created, added, removed] = await Promise.all([
      this.contract.queryFilter(this.contract.filters.Tranche_Created()),
      this.contract.queryFilter(this.contract.filters.Tranche_Balance_Added()),
      this.contract.queryFilter(
        this.contract.filters.Tranche_Balance_Removed()
      ),
    ]);
    const dp = await this.dp;
    return getTranchesFromHistory(created, added, removed, dp);
  }

  /** Executes contracts withdraw_from_tranche function */
  async withdrawFromTranche(
    trancheId: number,
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const tx = await this.contract.withdraw_from_tranche(trancheId);

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /** Returns amounts staked across all Vega keys for single Ethereum account */
  async userTotalStakedByVegaKey(address: string) {
    const addFilter = this.contract.filters.Stake_Deposited(address);
    const removeFilter = this.contract.filters.Stake_Removed(address);
    const addEvents = await this.contract.queryFilter(addFilter);
    const removeEvents = await this.contract.queryFilter(removeFilter);
    const res = combineStakeEventsByVegaKey(
      [...addEvents, ...removeEvents],
      await this.dp
    );
    return res;
  }
}
