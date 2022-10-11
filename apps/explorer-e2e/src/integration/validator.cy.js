context('Validator page', { tags: '@smoke' }, function () {
  const validatorMenuHeading = 'a[href="/validators"]';
  const tendermintDataHeader = '[data-testid="tendermint-header"]';
  const vegaDataHeader = '[data-testid="vega-header"]';
  const jsonSection = '.language-json';

  before('Visit validators page and obtain data', function () {
    cy.visit('/');
    cy.get(validatorMenuHeading).click();
    cy.get_validators().as('validators');
  });

  describe('Verify elements on page', function () {
    before('Ensure at least two validators are present', function () {
      assert.isAtLeast(
        this.validators.length,
        2,
        'Ensuring at least two validators exist'
      );
    });

    it('should be able to see validator page sections', function () {
      cy.get(vegaDataHeader)
        .contains('Vega data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        });

      cy.get(tendermintDataHeader)
        .contains('Tendermint data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        });
    });

    it('should be able to see relevant validator information', function () {
      this.validators.forEach((validator, index) => {
        cy.get(tendermintDataHeader)
          .contains('Tendermint data')
          .next()
          .within(() => {
            cy.get(jsonSection)
              .invoke('text')
              .convert_string_json_to_js_object()
              .then((validatorsInJson) => {
                const validatorInJson =
                  validatorsInJson.result.validators[index];

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

                // Proposer priority can change frequently mid test
                // Therefore only checking the field name is present.
                cy.contains('proposer_priority').should('be.visible');
              });
          });
      });
    });

    it('should be able to see validator page displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(validatorMenuHeading).click();
      cy.get(vegaDataHeader)
        .contains('Vega data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        });

      cy.get(tendermintDataHeader)
        .contains('Tendermint data')
        .and('is.visible')
        .next()
        .within(() => {
          cy.get(jsonSection).should('not.be.empty');
        });

      this.validators.forEach((validator) => {
        cy.get(tendermintDataHeader)
          .contains('Tendermint data')
          .next()
          .within(() => {
            cy.contains(validator.address).should('be.visible');
            cy.contains(validator.pub_key.type).should('be.visible');
            cy.contains(validator.pub_key.value).should('be.visible');
            cy.contains(validator.voting_power).should('be.visible');
            // Proposer priority can change frequently mid test
            // Therefore only checking the field name is present.
            cy.contains('proposer_priority').should('be.visible');
          });
      });
    });

    it('should be able to switch validator page between light and dark mode', function () {
      const whiteThemeSelectedMenuOptionColor = 'rgb(255, 7, 127)';
      const whiteThemeJsonFieldBackColor = 'rgb(255, 255, 255)';
      const whiteThemeSideMenuBackgroundColor = 'rgb(255, 255, 255)';
      const darkThemeSelectedMenuOptionColor = 'rgb(223, 255, 11)';
      const darkThemeJsonFieldBackColor = 'rgb(38, 38, 38)';
      const darkThemeSideMenuBackgroundColor = 'rgb(0, 0, 0)';
      const themeSwitcher = '[data-testid="theme-switcher"]';
      const jsonFields = '.hljs';
      const sideMenuBackground = '.absolute';

      // Engage dark mode if not allready set
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .then((background_color) => {
          if (background_color.includes(whiteThemeSideMenuBackgroundColor))
            cy.get(themeSwitcher).click();
        });

      // Engage white mode
      cy.get(themeSwitcher).click();

      // White Mode
      cy.get(validatorMenuHeading)
        .should('have.css', 'background-color')
        .and('include', whiteThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', whiteThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', whiteThemeSideMenuBackgroundColor);

      // Dark Mode
      cy.get(themeSwitcher).click();
      cy.get(validatorMenuHeading)
        .should('have.css', 'background-color')
        .and('include', darkThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', darkThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', darkThemeSideMenuBackgroundColor);
    });

    Cypress.Commands.add('get_validators', () => {
      cy.request({
        method: 'GET',
        url: `http://localhost:26617/validators`,
        headers: { 'content-type': 'application/json' },
      })
        .its(`body.result.validators`)
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
