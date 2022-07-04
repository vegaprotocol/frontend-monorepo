import staking from '../locators/staking.locators';

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'staking_validator_page_check_stake_next_epoch_value',
  function (expectedVal) {
    cy.log(
      `👉 **_Checking Staking Page - Validator Stake Next Epoch Value is ${expectedVal}_**`
    );
    cy.get(staking.stakeNextEpochValue, { timeout: 10000 })
      .contains(expectedVal, { timeout: 10000 })
      .should('be.visible');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'staking_validator_page_check_stake_this_epoch_value',
  function (expectedVal) {
    cy.log(
      `👉 **_Checking Staking Page - Validator Stake This Epoch Value is ${expectedVal}_**`
    );
    cy.get(staking.stakeThisEpochValue, { timeout: 10000 })
      .contains(expectedVal, { timeout: 10000 })
      .should('be.visible');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('staking_validator_page_add_stake', function (stake) {
  cy.log(`👉 **_Adding a stake of ${stake}_**`);
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
  ).should('be.visible');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('staking_validator_page_removeStake', function (stake) {
  cy.log(`👉 **_Removing a stake of ${stake}_**`);
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

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'staking_page_associate_tokens',
  function (amount, approve) {
    cy.log(`👉 **_Associating ${amount} tokens via Staking Page_**`);
    cy.get(staking.associateButton).click();
    cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
    cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);

    if (approve !== undefined && approve.toLowerCase() == 'approve') {
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

// ----------------------------------------------------------------------

Cypress.Commands.add('staking_page_disassociate_tokens', function (amount) {
  cy.log(`👉 **_Disassociating ${amount} tokens via Staking Page_**`);
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

// ----------------------------------------------------------------------
