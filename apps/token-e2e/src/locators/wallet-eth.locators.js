import common from './common.locators';

export default {
  ...common,
  walletContainer: '[data-testid="ethereum-wallet"]',
  walletHeader: '[data-testid="wallet-header"] h1',
  connectToEthButton: '[data-testid="connect-to-eth-wallet-button"]',
  connectorList: '[data-testid="web3-connector-list"]',
  connectorCapsule: '[data-testid="web3-connector-Unknown"]',
  associate: '[href="/staking/associate"]',
  disassociate: '[href="/staking/disassociate"]',
  disconnect: '[data-testid="disconnect-from-eth-wallet-button"]',
  accountNo: '[data-testid="ethereum-account-truncated"]',
  currencyTitle: '[data-testid="currency-title"]',
  currencyValue: '[data-testid="currency-value"]',
  vegaInVesting: '[data-testid="vega-in-vesting-contract"]',
  vegaInWallet: '[data-testid="vega-in-wallet"]',
  progressBar: '[data-testid="progress-bar"]',
  currencyLocked: '[data-testid="currency-locked"]',
  currencyUnlocked: '[data-testid="currency-unlocked"]',
};
