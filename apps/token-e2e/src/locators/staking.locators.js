import common from './common.locators';

export default {
  ...common,
  guideLink: '[data-testid="staking-guide-link"]',
  stakingDescription: '[data-testid="staking-description"]',
  validatorNames: '[data-testid="node-list-item-name"]',
  epochEndingText: '[data-testid="epoch-countdown"]',
  addStakeRadioButton: '[data-testid="add-stake-radio"]',
  removeStakeRadioButton: '[data-testid="remove-stake-radio"]',
  tokenAmountInput: '[data-testid="token-amount-input"]',
  tokenInputApprove: '[data-testid="token-input-approve-button"]',
  tokenInputSubmit: '[data-testid="token-input-submit-button"]',
  stakedAmounts: '[data-testid="staked-validator-item"]',
  stakeNextEpochValue: '[data-testid="stake-next-epoch"]',
  stakeThisEpochValue: '[data-testid="stake-this-epoch"]',
  stakeMaximumTokens: '[data-testid="token-amount-use-maximum"]',
  stakeAssociateWalletRadio: '[data-testid="associate-radio-wallet"]',
  disassociateButton: '[data-testid="disassociate-tokens-btn"]',
  associateMoreTokensButton: '[data-testid="associate-more-tokens-btn"]',
  associateButton: '[data-testid="associate-tokens-btn"]',
};
