import staking from '../locators/staking.locators';

Cypress.Commands.add('wait_for_begining_of_epoch', () => {
  cy.highlight(`Waiting for next epoch to start`);
  cy.contains('Waiting for next epoch to start', { timeout: 10000 }).should('not.exist');
  cy.contains('Waiting for next epoch to start', { timeout: 20000 });
});

Cypress.Commands.add('staking_validator_page_add_stake', (stake) => {
  cy.highlight(`Adding a stake of ${stake}`);
  cy.get(staking.addStakeRadioButton).click({ force: true });
  cy.get(staking.tokenAmountInput).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(staking.tokenInputSubmit, { timeout: 8000 })
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
  cy.get(staking.removeStakeRadioButton).click({ force: true });
  cy.get(staking.tokenAmountInput).type(stake);
  cy.wait_for_begining_of_epoch();
  cy.get(staking.tokenInputSubmit)
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
    cy.get(staking.associateButton).click();
    cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
    cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);
    if (approve) {
      cy.get(staking.tokenInputApprove, { timeout: 40000 })
        .should('be.enabled')
        .click();
      cy.contains('Approve $VEGA Tokens for staking on Vega').should(
        'be.visible'
      );
      cy.contains('Approve $VEGA Tokens for staking on Vega', {
        timeout: 40000,
      }).should('not.exist');
    }
    cy.get(staking.tokenInputSubmit, { timeout: 40000 })
      .should('be.enabled')
      .click();
    cy.contains('can now participate in governance and nominate a validator', {
      timeout: 60000,
    }).should('be.visible');
  }
);

Cypress.Commands.add('staking_page_disassociate_tokens', (amount) => {
  cy.highlight(`Disassociating ${amount} tokens via Staking Page`);
  cy.get(staking.disassociateButton).click();
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
  cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);

  cy.get(staking.tokenInputSubmit, { timeout: 40000 })
    .should('be.enabled')
    .click();
  cy.contains(`${amount} $VEGA tokens have been returned to Ethereum wallet`, {
    timeout: 60000,
  }).should('be.visible');
});

Cypress.Commands.add('staking_page_disassociate_all_tokens', () => {
  cy.highlight(`Disassociating all tokens via Staking Page`);
  cy.get(staking.disassociateButton).click();
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 20000 }).click();
  cy.get(staking.stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(staking.tokenInputSubmit, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', {
    timeout: 60000,
  }).should('be.visible');
});
