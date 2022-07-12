const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const tokenInputApprove = '[data-testid="token-input-approve-button"]';
const stakeNextEpochValue = '[data-testid="stake-next-epoch"]';
const addStakeRadioButton = '[data-testid="add-stake-radio"]';
const removeStakeRadioButton = '[data-testid="remove-stake-radio"]';
const ethWalletAssociateButton = '[href="/staking/associate"]';
const ethWalletDissociateButton = '[href="/staking/disassociate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const stakeMaximumTokens = '[data-testid="token-amount-use-maximum"]';

Cypress.Commands.add('wait_for_begining_of_epoch', () => {
  cy.highlight(`Waiting for next epoch to start`);
  cy.contains('Waiting for next epoch to start', { timeout: 10000 }).should(
    'not.exist'
  );
  cy.contains('Waiting for next epoch to start', { timeout: 20000 });
});

Cypress.Commands.add('staking_validator_page_add_stake', (stake) => {
  cy.highlight(`Adding a stake of ${stake}`);
  cy.get(addStakeRadioButton).click({ force: true });
  cy.get(tokenAmountInputBox).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(tokenSubmitButton, { timeout: 8000 })
    .should('be.enabled')
    .and('contain', `Add ${stake} $VEGA tokens`)
    .and('be.visible')
    .click();
  cy.contains(
    'At the beginning of the next epoch your $VEGA will be nominated to the validator',
    { timeout: 20000 }
  ).should('be.visible');
});

Cypress.Commands.add('staking_validator_page_removeStake', (stake) => {
  cy.highlight(`Removing a stake of ${stake}`);
  cy.get(removeStakeRadioButton).click({ force: true });
  cy.get(tokenAmountInputBox).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(tokenSubmitButton)
    .should('be.enabled', { timeout: 8000 })
    .and('contain', `Remove ${stake} $VEGA tokens at the end of epoch`)
    .and('be.visible')
    .click();
  cy.contains(`${stake} $VEGA has been removed from validator`).should(
    'be.visible'
  );
});

Cypress.Commands.add(
  'staking_page_associate_tokens',
  (amount, approve = false) => {
    cy.highlight(`Associating ${amount} tokens`);
    cy.get(ethWalletAssociateButton).first().click();
    cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
    cy.get(tokenAmountInputBox, { timeout: 10000 }).type(amount);
    if (approve) {
      cy.get(tokenInputApprove, { timeout: 40000 })
        .should('be.enabled')
        .click();
      cy.contains('Approve $VEGA Tokens for staking on Vega').should(
        'be.visible'
      );
      cy.contains('Approve $VEGA Tokens for staking on Vega', {
        timeout: 40000,
      }).should('not.exist');
    }
    cy.get(tokenSubmitButton, { timeout: 40000 }).should('be.enabled').click();
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

  cy.get(tokenSubmitButton, { timeout: 40000 }).should('be.enabled').click();
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
  'convertTokenValueToNumber',
  { prevSubject: true },
  (subject) => {
    return parseFloat(subject.replace(/,/g, ''));
  }
);
