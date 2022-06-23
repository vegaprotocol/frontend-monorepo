import staking from '../locators/staking.locators';

Cypress.Commands.add('stakingPage_getValidatorNamesSorted', function () {
  let validatorNames = [];
  cy.get(staking.validatorNames)
    .each(($validatorName) => {
      validatorNames.push($validatorName.text());
    })
    .then(() => {
      return validatorNames.sort();
    });
});
