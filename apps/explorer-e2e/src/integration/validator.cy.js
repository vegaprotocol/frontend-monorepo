context('Validator page', { tags: '@smoke' }, function () {
  const validatorNavigation = 'a[href="/validators"]';
  const tendermintDataHeader = '[data-testid="tendermint-header"]';
  const vegaDataHeader = '[data-testid="vega-header"]';
  const jsonSection = '.language-json'
  
  before('Visit validators page and obtain data', function () {
    cy.visit('/');
    cy.get(validatorNavigation).click();
    cy.get_validators().as('validators');
  })

  describe('Verify elements on page', function () {

    before('Ensure at least two validators are present', function () {
      assert.isAtLeast(this.validators.length, 2, 'Ensuring at least two validators exist')
    })

    it('Validator page is displayed', function () {
      cy.get(vegaDataHeader)
        .contains('Vega data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        })

      cy.get(tendermintDataHeader)
        .contains('Tendermint data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        })
    });

    it('Validator page contains relevant validator information', function () {
      this.validators.forEach((validator, index) => {
        cy.get(tendermintDataHeader)
          .contains('Tendermint data')
          .next()
          .within(() => {
            cy.get(jsonSection)
              .invoke('text')
              .convert_string_json_to_js_object()
              .then((validatorsInJson) => { 
                const validatorInJson = validatorsInJson.result.validators[index];

                assert.equal(
                  validatorInJson.address,
                  validator.address,
                  `Checking that validator address shown in json matches system data`
                );
                cy.contains(validator.address).should('be.visible');

                assert.equal(
                  validatorInJson.pub_key.type,
                  validator.pub_key.type,
                  `Checking that validator public key type shown in json matches system data`
                );
                cy.contains(validator.pub_key.type).should('be.visible');

                assert.equal(
                  validatorInJson.pub_key.value,
                  validator.pub_key.value,
                  `Checking that validator public key value shown in json matches system data`
                );
                cy.contains(validator.pub_key.value).should('be.visible');

                assert.equal(
                  validatorInJson.voting_power,
                  validator.voting_power,
                  `Checking that validator voting power in json matches system data`
                );
                cy.contains(validator.voting_power).should('be.visible');

                assert.equal(
                  validatorInJson.proposer_priority,
                  validator.proposer_priority,
                  `Checking that validator proposer priority shown in json matches system data`
                );
                cy.contains(validator.proposer_priority).should('be.visible');
              })
          })
      })
    });

    it('Validator page is displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(validatorNavigation).click();
      cy.get(vegaDataHeader)
        .contains('Vega data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        })

      cy.get(tendermintDataHeader)
        .contains('Tendermint data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        })

      this.validators.forEach((validator) => {
        cy.get(tendermintDataHeader)
          .contains('Tendermint data')
          .next()
          .within(() => {
            cy.contains(validator.address).should('be.visible');
            cy.contains(validator.pub_key.type).should('be.visible');
            cy.contains(validator.pub_key.value).should('be.visible');
            cy.contains(validator.voting_power).should('be.visible');
            cy.contains(validator.proposer_priority).should('be.visible');
          })
      })
    });

    Cypress.Commands.add('get_validators', () => {
      cy.request({
        method: 'GET',
        url: `http://localhost:26617/validators`,
        headers: { 'content-type': 'application/json' },
      })
        .its(
          `body.result.validators`
        )
        .then(function (response) {
          let validators = [];
          response.forEach((account, index) => {
            validators[index] = account;
          });
          return validators;
        });
    });
  });
});
