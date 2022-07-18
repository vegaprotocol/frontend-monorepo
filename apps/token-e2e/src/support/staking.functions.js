const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const tokenInputApprove = '[data-testid="token-input-approve-button"]';
const addStakeRadioButton = '[data-testid="add-stake-radio"]';
const removeStakeRadioButton = '[data-testid="remove-stake-radio"]';
const ethWalletAssociateButton = '[href="/staking/associate"]';
const ethWalletDissociateButton = '[href="/staking/disassociate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const stakeMaximumTokens = '[data-testid="token-amount-use-maximum"]';
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');

Cypress.Commands.add('wait_for_begining_of_epoch', () => {
  cy.contains('Waiting for next epoch to start', epochTimeout).should(
    'not.exist'
  );
  cy.contains('Waiting for next epoch to start', epochTimeout);
});

Cypress.Commands.add('staking_validator_page_add_stake', (stake) => {
  cy.highlight(`Adding a stake of ${stake}`);
  cy.get(addStakeRadioButton).click({ force: true });
  cy.get(tokenAmountInputBox).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(tokenSubmitButton, epochTimeout)
    .should('be.enabled')
    .and('contain', `Add ${stake} $VEGA tokens`)
    .and('be.visible')
    .click();
});

Cypress.Commands.add('staking_validator_page_remove_stake', (stake) => {
  cy.highlight(`Removing a stake of ${stake}`);
  cy.get(removeStakeRadioButton).click({ force: true });
  cy.get(tokenAmountInputBox).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(tokenSubmitButton)
    .should('be.enabled', epochTimeout)
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
    cy.get(tokenAmountInputBox, epochTimeout).type(amount);
    if (approve) {
      cy.get(tokenInputApprove, epochTimeout)
        .should('be.enabled')
        .click();
      cy.contains('Approve $VEGA Tokens for staking on Vega').should(
        'be.visible'
      );
      cy.contains('Approve $VEGA Tokens for staking on Vega', epochTimeout).should(
        'not.exist');
    }
    cy.get(tokenSubmitButton, epochTimeout).should('be.enabled').click();
    cy.contains('can now participate in governance and nominate a validator', txTimeout).should(
      'be.visible');
  }
);

Cypress.Commands.add('staking_page_disassociate_tokens', (amount) => {
  cy.highlight(`Disassociating ${amount} tokens via Staking Page`);
  cy.get(ethWalletDissociateButton).first().click();
  cy.get(associateWalletRadioButton, epochTimeout).click();
  cy.get(tokenAmountInputBox, epochTimeout).type(amount);

  cy.get(tokenSubmitButton, epochTimeout).should('be.enabled').click();
  cy.contains(`${amount} $VEGA tokens have been returned to Ethereum wallet`, txTimeout).should(
    'be.visible');
});

Cypress.Commands.add('staking_page_disassociate_all_tokens', () => {
  cy.highlight(`Disassociating all tokens via Staking Page`);
  cy.get(ethWalletDissociateButton).first().click();
  cy.get(associateWalletRadioButton, epochTimeout).click();
  cy.get(stakeMaximumTokens, epochTimeout).click();
  cy.get(tokenSubmitButton, epochTimeout).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', txTimeout).should(
    'be.visible');
});
