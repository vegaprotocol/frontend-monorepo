import staking from '../locators/staking.locators';

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'stakingValidatorPage_check_stakeNextEpochValue',
  function (expectedVal) {
    cy.get(staking.stakeNextEpochValue, { timeout: 10000 }).contains(
      expectedVal.toFixed(2),
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
