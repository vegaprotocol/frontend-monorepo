import { ethers, Wallet } from 'ethers';

export let wallet: Wallet | undefined;

export function createEthereumWallet(
  ethWalletMnemonic: string,
  ethereumProviderUrl: string
) {
  // create provider/wallet
  const provider = new ethers.providers.JsonRpcProvider({
    url: ethereumProviderUrl,
  });

  const privateKey = Wallet.fromMnemonic(
    ethWalletMnemonic,
    getAccount()
  ).privateKey;

  // this wallet (ozone access etc) is already set up with 6 million vega (eth)
  wallet = new Wallet(privateKey, provider);
}

// derivation path
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;
