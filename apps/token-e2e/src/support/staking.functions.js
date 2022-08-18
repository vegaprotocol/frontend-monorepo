const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const tokenInputApprove = '[data-testid="token-input-approve-button"]';
const addStakeRadioButton = '[data-testid="add-stake-radio"]';
const removeStakeRadioButton = '[data-testid="remove-stake-radio"]';
const ethWalletAssociateButton = '[href="/staking/associate"]';
const ethWalletDissociateButton = '[href="/staking/disassociate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const stakeMaximumTokens = '[data-testid="token-amount-use-maximum"]';
const stakeValidatorListPendingStake = '[col-id="pendingStake"]';
const stakeValidatorListTotalStake = '[col-id="totalStakeThisEpoch"]';
const stakeValidatorListTotalShare = '[col-id="share"]';
const stakeValidatorListName = '[col-id="validator"]';
const txTimeout = Cypress.env('txTimeout');

Cypress.Commands.add('wait_for_begining_of_epoch', () => {
  cy.contains('Waiting for next epoch to start', { timeout: 10000 }).should(
    'not.exist'
  );
  cy.contains('Waiting for next epoch to start', { timeout: 20000 });
});

Cypress.Commands.add('staking_validator_page_add_stake', (stake) => {
  cy.highlight(`Adding a stake of ${stake}`);
  cy.get(addStakeRadioButton, { timeout: 8000 }).click({ force: true });
  cy.get(tokenAmountInputBox).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(tokenSubmitButton, { timeout: 8000 })
    .should('be.enabled')
    .and('contain', `Add ${stake} $VEGA tokens`)
    .and('be.visible')
    .click();
});

Cypress.Commands.add('staking_validator_page_remove_stake', (stake) => {
  cy.highlight(`Removing a stake of ${stake}`);
  cy.get(removeStakeRadioButton, { timeout: 8000 }).click();
  cy.get(tokenAmountInputBox).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(tokenSubmitButton)
    .should('be.enabled', { timeout: 8000 })
    .and('contain', `Remove ${stake} $VEGA tokens at the end of epoch`)
    .and('be.visible')
    .click();
});

Cypress.Commands.add(
  'staking_page_associate_tokens',
  (amount, approve = false) => {
    cy.highlight(`Associating ${amount} tokens`);
    cy.get(ethWalletAssociateButton).first().click();
    cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
    cy.get(tokenAmountInputBox, { timeout: 10000 }).type(amount);
    if (approve) {
      cy.get(tokenInputApprove, txTimeout).should('be.enabled').click();
      cy.contains('Approve $VEGA Tokens for staking on Vega').should(
        'be.visible'
      );
      cy.contains('Approve $VEGA Tokens for staking on Vega', {
        timeout: 40000,
      }).should('not.exist');
    }
    cy.get(tokenSubmitButton, txTimeout).should('be.enabled').click();
    cy.contains('can now participate in governance and nominate a validator', {
      timeout: 60000,
    }).should('be.visible');
  }
);

Cypress.Commands.add('staking_page_disassociate_tokens', (amount) => {
  cy.highlight(`Disassociating ${amount} tokens via Staking Page`);
  cy.get(ethWalletDissociateButton).first().click();
  cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
  cy.get(tokenAmountInputBox, { timeout: 10000 }).type(amount);

  cy.get(tokenSubmitButton, txTimeout).should('be.enabled').click();
  cy.contains(`${amount} $VEGA tokens have been returned to Ethereum wallet`, {
    timeout: 60000,
  }).should('be.visible');
});

Cypress.Commands.add('staking_page_disassociate_all_tokens', () => {
  cy.highlight(`Disassociating all tokens via Staking Page`);
  cy.get(ethWalletDissociateButton).first().click();
  cy.get(associateWalletRadioButton, { timeout: 20000 }).click();
  cy.get(stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(tokenSubmitButton, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', {
    timeout: 60000,
  }).should('be.visible');
});

Cypress.Commands.add(
  'click_on_validator_from_list',
  (validatorNumber, validatorName = null) => {
    cy.contains('Waiting for next epoch to start').should('not.exist');
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
        .find(stakeValidatorListName)
        .click();
    }
  }
);

Cypress.Commands.add(
  'validate_validator_list_total_stake_and_share',
  (
    positionOnList,
    expectedValidatorName,
    expectedTotalStake,
    expectedTotalShare
  ) => {
    cy.get(`[row-id="${positionOnList}"]`).within(() => {
      cy.get(stakeValidatorListName).should('have.text', expectedValidatorName);
      cy.get(stakeValidatorListTotalStake).should(
        'have.text',
        expectedTotalStake
      );
      cy.get(stakeValidatorListTotalShare).should(
        'have.text',
        expectedTotalShare
      );
    });
  }
);
