import common from './common.locators';

export default {
  ...common,
  connectRestForm: '[data-testid="rest-connector-form"]',
  name: '#wallet',
  passphrase: '#passphrase',
  vegawallet: '[data-testid="vega-wallet"]',
  ethWallet: '[data-testid="ethereum-wallet"]',
  ethWalletConnectToEth: '[data-testid="connect-to-eth-wallet-button"]',
  ethWalletConnect: '[data-testid="web3-connector-Unknown"]',
  ethWalletAssociate: '[href="/staking/associate"]',
  ethWalletDisassociate: '[href="/staking/disassociate"]',
};
