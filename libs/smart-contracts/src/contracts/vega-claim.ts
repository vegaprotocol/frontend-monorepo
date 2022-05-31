import type { Networks } from '@vegaprotocol/react-helpers';
import { ethers } from 'ethers';
import claimAbi from '../abis/claim_abi.json';
import { EnvironmentConfig } from '../config';
import { asciiToHex } from '../utils';
import { BaseContract } from './base-contract';

export const UNSPENT_CODE = '0x0000000000000000000000000000000000000000';
export const SPENT_CODE = '0x0000000000000000000000000000000000000001';

/**
 * Example:
 * ```
 * const provider = new Web3.providers.HttpProvider(
 *   "https://ropsten.infura.io/v3/5aff9e61ad844bcf982d0d0c3f1d29f1"
 * );
 * const web3 = new Web3(provider)
 
 * // Ropsten address
 * const contract = new VegaClaim(web3, "0xAf5dC1772714b2F4fae3b65eb83100f1Ea677b21")
 * contract.isCountryBlocked("US").then(console.log)
 * contract.isClaimValid({ claimCode: "0x...", expiry: 0, nonce: "0x00", account: "0x00" })
 * ```
 */
export class VegaClaim extends BaseContract {
  public contract: ethers.Contract;

  constructor(
    network: Networks,
    provider: ethers.providers.Web3Provider,
    signer?: ethers.Signer
  ) {
    super(provider, signer);

    this.contract = new ethers.Contract(
      EnvironmentConfig[network].claimAddress,
      claimAbi,
      this.signer || this.provider
    );
  }

  /** Execute contracts commit_untargeted function */
  async commit(
    s: string,
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const tx = await this.contract.commit_untargeted(s);

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /**
   * Perform the final claim. Automatically switches between targeted and
   * untargeted claims. However, for untargeted ones, it's assumed that commit
   * was performed and mined beforehand
   * @return {Promise<boolean>}
   */
  public async claim(
    {
      amount,
      tranche,
      expiry,
      target,
      country,
      v,
      r,
      s,
    }: {
      amount: string;
      tranche: number;
      expiry: number;
      target?: string;
      country: string;
      v: number;
      r: string;
      s: string;
    },
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const tx = await this.contract[
      target != null ? 'claim_targeted' : 'claim_untargeted'
    ](
      ...[
        { r, s, v },
        {
          amount,
          tranche,
          expiry,
        },
        asciiToHex(country),
        target,
      ].filter(Boolean)
    );

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  /**
   * Check if this code was already committed to by this account
   * @return {Promise<boolean>}
   */
  async isCommitted({ s }: { s: string }): Promise<string> {
    return await this.contract.commitments(s);
  }

  /**
   * Checks if a code is past its' expiry date
   * @param expiry Expiry of the code
   * @returns Promise<boolean>
   */
  async isExpired(expiry: number): Promise<boolean> {
    return expiry < (await this.provider.getBlock('latest')).timestamp;
  }

  /**
   * Utility method to check if the nonce has already been used. If it has the code has already been claimed.
   * @param s The s part of the signature
   * @return {string}
   */
  async isUsed(s: string): Promise<boolean> {
    return (await this.contract.commitments(s)) === SPENT_CODE;
  }

  /**
   * Check if country is blocked. country must be the two letter ISO code
   * @param  {string}           country 2 letter ISO code
   * @return {Promise<boolean>}
   */
  async isCountryBlocked(country: string): Promise<boolean> {
    const isAllowed = await this.contract.allowed_countries(
      asciiToHex(country)
    );
    return !isAllowed;
  }
}
