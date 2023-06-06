import { closeDialog } from './common.functions';
import { vegaWalletTeardown } from './wallet-teardown.functions';

const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const tokenInputApprove = '[data-testid="token-input-approve-button"]';
const addStakeRadioButton = '[data-testid="add-stake-radio"]';
const removeStakeRadioButton = '[data-testid="remove-stake-radio"]';
const ethWalletAssociateButton = '[href="/token/associate"]:visible';
const ethWalletDissociateButton = '[href="/token/disassociate"]:visible';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]:visible';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const associateContractRadioButton = '[data-testid="associate-radio-contract"]';
const stakeMaximumTokens = '[data-testid="token-amount-use-maximum"]';
const stakeValidatorListPendingStake = '[col-id="pendingStake"]';
const stakeValidatorListTotalStake = 'total-stake';
const stakeValidatorListTotalShare = 'total-stake-share';
const stakeValidatorListName = '[col-id="validator"]';
const vegaKeySelector = '#vega-key-selector';

const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');

export function waitForBeginningOfEpoch() {
  cy.contains('Waiting for next epoch to start', epochTimeout).should(
    'not.exist'
  );
  cy.contains('Waiting for next epoch to start', epochTimeout).should(
    'be.visible'
  );
}

export function stakingValidatorPageAddStake(stake: string) {
  cy.highlight(`Adding a stake of ${stake}`);
  cy.get(addStakeRadioButton, epochTimeout).click({ force: true });
  cy.get(tokenAmountInputBox).type(stake);
  waitForBeginningOfEpoch();
  cy.get(tokenSubmitButton, epochTimeout)
    .should('be.enabled')
    .and('contain', `Add ${stake} $VEGA tokens`)
    .and('be.visible')
    .click();
}

export function stakingValidatorPageRemoveStake(stake: string) {
  cy.highlight(`Removing a stake of ${stake}`);
  cy.get(removeStakeRadioButton, epochTimeout).click();
  cy.get(tokenAmountInputBox).type(stake);
  waitForBeginningOfEpoch();
  cy.get(tokenSubmitButton)
    .should('be.enabled', epochTimeout)
    .and('contain', `Remove ${stake} $VEGA tokens at the end of epoch`)
    .and('be.visible')
    .click();
  cy.contains('been removed from validator', txTimeout).should('be.visible');
  closeDialog();
}

export function stakingPageAssociateTokens(
  amount: string,
  options?: associateOptions
) {
  const approve = options && options.approve ? options.approve : false;
  const type = options && options.type ? options.type : 'wallet';
  const skipConfirmation =
    options && options.skipConfirmation ? options.skipConfirmation : false;

  cy.highlight(`Associating ${amount} tokens from ${type}`);
  cy.get(ethWalletAssociateButton).first().click();
  if (type === 'wallet') {
    cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
  } else if (type === 'contract') {
    cy.get(associateContractRadioButton, { timeout: 30000 }).click();
  } else {
    cy.highlight(`${type} is not association option`);
  }
  cy.get(tokenAmountInputBox, epochTimeout).type(amount);
  if (approve) {
    cy.get(tokenInputApprove, txTimeout).should('be.enabled').click();
    cy.contains('Approve $VEGA Tokens for staking on Vega').should(
      'be.visible'
    );
    cy.contains('Approve $VEGA Tokens for staking on Vega', txTimeout).should(
      'not.exist'
    );
  }
  cy.get(tokenSubmitButton, txTimeout).should('be.enabled').click();

  if (!skipConfirmation) {
    cy.contains(
      `Associating with Vega key. Waiting for ${Cypress.env(
        'blockConfirmations'
      )} more confirmations..`,
      txTimeout
    ).should('be.visible');
    cy.contains(
      'can now participate in governance and nominate a validator',
      txTimeout
    ).should('be.visible');
  }
}

export function stakingPageDisassociateTokens(
  amount: string,
  options?: associateOptions
) {
  const type = options && options.type ? options.type : 'wallet';
  cy.highlight(
    `Disassociating ${amount} tokens via Staking Page back to ${type}`
  );
  cy.get(ethWalletDissociateButton).first().click();

  cy.get(vegaKeySelector, txTimeout)
    .invoke('attr', 'disabled')
    .then((disabled) => {
      if (!disabled) {
        cy.get(vegaKeySelector).select(
          `${type}-${Cypress.env('vegaWalletPublicKey')}`
        );
      }
    });

  cy.get(tokenAmountInputBox, epochTimeout).type(amount);
  cy.get(tokenSubmitButton, epochTimeout).should('be.enabled').click();

  if (type === 'wallet') {
    cy.contains(
      `${amount} $VEGA tokens have been returned to Ethereum wallet`,
      txTimeout
    ).should('be.visible');
  } else if (type === 'contract') {
    cy.contains(
      `${amount} $VEGA tokens have been returned to Vesting contract`,
      txTimeout
    ).should('be.visible');
  }
}

export function stakingPageDisassociateAllTokens(type = 'wallet') {
  cy.highlight(`Disassociating all tokens via Staking Page`);
  cy.get(ethWalletDissociateButton).first().click();
  cy.get(stakeMaximumTokens, epochTimeout).click();
  cy.get(tokenSubmitButton, epochTimeout).click();
  if (type === 'wallet') {
    cy.contains(
      `$VEGA tokens have been returned to Ethereum wallet`,
      txTimeout
    ).should('be.visible');
  } else if (type === 'contract') {
    cy.contains(
      `$VEGA tokens have been returned to Vesting contract`,
      txTimeout
    ).should('be.visible');
  }
}

export function clickOnValidatorFromList(
  validatorNumber: number,
  validatorName = null
) {
  cy.contains('Loading...', epochTimeout).should('not.exist');
  waitForBeginningOfEpoch();
  // below is to ensure validator list is shown
  cy.get(stakeValidatorListName, { timeout: 10000 }).should('exist');
  cy.get(stakeValidatorListPendingStake, txTimeout).should(
    'not.contain',
    '2,000,000,000,000,000,000.00' // number due to bug #936
  );
  if (validatorName) {
    cy.contains(validatorName).click();
  } else {
    cy.get(`[row-id="${validatorNumber}"]`)
      .should('be.visible')
      .find(stakeValidatorListName)
      .click();
  }
}

export function validateValidatorListTotalStakeAndShare(
  positionOnList: string,
  expectedTotalStake: string,
  expectedTotalShare: string
) {
  cy.contains('Loading...', epochTimeout).should('not.exist');
  waitForBeginningOfEpoch();
  cy.get(`[row-id="${positionOnList}"]`)
    .eq(1)
    .within(() => {
      cy.getByTestId(stakeValidatorListTotalStake, epochTimeout).should(
        'have.text',
        expectedTotalStake
      );
      cy.getByTestId(stakeValidatorListTotalShare, epochTimeout).should(
        'have.text',
        expectedTotalShare
      );
    });
}

export function ensureSpecifiedUnstakedTokensAreAssociated(
  tokenAmount: string
) {
  cy.highlight(`Ensuring ${tokenAmount} token(s) associated`);
  cy.get(vegaWalletUnstakedBalance)
    .children()
    .children()
    .eq(1)
    .invoke('text')
    .then((unstakedBalance) => {
      if (parseFloat(unstakedBalance) != parseFloat(tokenAmount)) {
        vegaWalletTeardown();
        cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
          '0.00',
          txTimeout
        );
        stakingPageAssociateTokens(tokenAmount);
      }
    });
}

export function closeStakingDialog() {
  cy.getByTestId('dialog-title', txTimeout).should(
    'contain.text',
    'At the beginning of the next epoch'
  );
  cy.getByTestId('dialog-content')
    .last()
    .within(() => {
      cy.get('a').should('have.text', 'Back to Staking').click();
    });
}

export function validateWalletCurrency(
  currencyTitle: string,
  expectedAmount: string
) {
  cy.get("[data-testid='currency-title']", txTimeout)
    .contains(currencyTitle, txTimeout)
    .parent()
    .parent()
    .within(() => {
      cy.getByTestId('currency-value', txTimeout).should(
        'have.text',
        expectedAmount
      );
    });
}

interface associateOptions {
  approve?: boolean;
  type?: string;
  skipConfirmation?: boolean;
}
