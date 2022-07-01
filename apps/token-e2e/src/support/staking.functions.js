import staking from '../locators/staking.locators';

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'staking_validator_page_check_stake_next_epoch_value',
  function (expectedVal) {
    cy.get(staking.stakeNextEpochValue, { timeout: 10000 }).contains(
      expectedVal,
      { timeout: 10000 }
    );
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'staking_waitForEpochRemainingSeconds',
  function (secondsRemaining) {
    cy.get(staking.epochEndingText)
      .contains(`Next epoch in ${secondsRemaining} seconds`, {
        timeout: `${secondsRemaining * 1100}`,
      })
      .should('be.visible');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('staking_validator_page_add_stake', function (stake) {
  cy.get(staking.addStakeRadioButton).click({ force: true });
  cy.get(staking.tokenAmountInput).type(stake);
  cy.contains('Waiting for next epoch to start', { timeout: 10000 });
  cy.get(staking.tokenInputSubmit, { timeout: 8000 })
    .should('be.enabled')
    .and('contain', `Add ${stake} $VEGA tokens`)
    .and('be.visible')
    .click();
  cy.contains(
    'At the beginning of the next epoch your $VEGA will be nominated to the validator',
    { timeout: 20000 }
  );
});

// ----------------------------------------------------------------------

Cypress.Commands.add('staking_validator_page_removeStake', function (stake) {
  cy.get(staking.removeStakeRadioButton).click({ force: true });
  cy.get(staking.tokenAmountInput).type(stake);
  cy.contains('Waiting for next epoch to start', { timeout: 10000 });
  cy.get(staking.tokenInputSubmit)
    .should('be.enabled', { timeout: 8000 })
    .and('contain', `Remove ${stake} $VEGA tokens at the end of epoch`)
    .and('be.visible')
    .click();
  cy.contains(`${stake} $VEGA has been removed from validator`).should(
    'be.visible'
  );
});
