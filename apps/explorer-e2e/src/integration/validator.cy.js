context('Validator page', { tags: '@smoke' }, function () {
  const validatorMenuHeading = 'a[href="/validators"]';
  const tendermintDataHeader = '[data-testid="tendermint-header"]';
  const vegaDataHeader = '[data-testid="vega-header"]';
  const jsonSection = '.language-json';

  before('Visit validators page and obtain data', function () {
    cy.visit('/');
    cy.get(validatorMenuHeading).click();
    cy.get_validators().as('validators');
    cy.get_nodes().as('nodes');
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

    it('should be able to see relevant validator information in tendermint section', function () {
      cy.get(tendermintDataHeader)
        .contains('Tendermint data')
        .next()
        .within(() => {
          cy.get(jsonSection)
            .invoke('text')
            .convert_string_json_to_js_object()
            .then((validatorsInJson) => {
              this.validators.forEach((validator, index) => {
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

    it('should be able to see relevant node information in vega data section', function () {
      cy.get(vegaDataHeader)
        .contains('Vega data')
        .next()
        .within(() => {
          cy.get(jsonSection)
            .invoke('text')
            .convert_string_json_to_js_object()
            .then((nodesInJson) => {
              this.nodes.forEach((node, index) => {
                const nodeInJson = nodesInJson.nodes[index];

                // Vegacapsule shows no info or null for following fields:
                // name, infoURL, avatarUrl, location, epoch data
                // Therefore, these values remain unchecked.

                assert.equal(
                  nodeInJson.__typename,
                  node.__typename,
                  `Checking that node __typename shown in json matches system data`
                );
                cy.contains(node.__typename).should('be.visible');

                assert.equal(
                  nodeInJson.id,
                  node.id,
                  `Checking that node id shown in json matches system data`
                );
                cy.contains(node.id).should('be.visible');

                assert.equal(
                  nodeInJson.pubkey,
                  node.pubkey,
                  `Checking that node pubkey shown in json matches system data`
                );
                cy.contains(node.pubkey).should('be.visible');

                assert.equal(
                  nodeInJson.tmPubkey,
                  node.tmPubkey,
                  `Checking that node tmPubkey shown in json matches system data`
                );
                cy.contains(node.tmPubkey).should('be.visible');

                assert.equal(
                  nodeInJson.ethereumAddress,
                  node.ethereumAddress,
                  `Checking that node ethereumAddress shown in json matches system data`
                );
                cy.contains(node.ethereumAddress).should('be.visible');

                assert.equal(
                  nodeInJson.stakedByOperator,
                  node.stakedByOperator,
                  `Checking that node stakedByOperator value shown in json matches system data`
                );
                cy.contains(node.stakedByOperator).should('be.visible');

                assert.equal(
                  nodeInJson.stakedByDelegates,
                  node.stakedByDelegates,
                  `Checking that node stakedByDelegates value shown in json matches system data`
                );
                cy.contains(node.stakedByDelegates).should('be.visible');

                assert.equal(
                  nodeInJson.stakedTotal,
                  node.stakedTotal,
                  `Checking that node stakedTotal shown in json matches system data`
                );
                cy.contains(node.stakedTotal).should('be.visible');

                assert.equal(
                  nodeInJson.pendingStake,
                  node.pendingStake,
                  `Checking that node pendingStake shown in json matches system data`
                );
                cy.contains(node.pendingStake).should('be.visible');

                assert.equal(
                  nodeInJson.status,
                  node.status,
                  `Checking that node status shown in json matches system data`
                );
                cy.contains(node.status).should('be.visible');
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

      cy.get(tendermintDataHeader)
        .contains('Tendermint data')
        .next()
        .within(() => {
          this.validators.forEach((validator) => {
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
      const darkThemeSelectedMenuOptionColor = 'rgb(215, 251, 80)';
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

    Cypress.Commands.add('get_nodes', () => {
      const mutation =
        '{nodes { id name infoUrl avatarUrl pubkey tmPubkey ethereumAddress \
          location stakedByOperator stakedByDelegates stakedTotal pendingStake \
          epochData { total offline online __typename } status name __typename}}';
      cy.request({
        method: 'POST',
        url: `http://localhost:3028/query`,
        body: {
          query: mutation,
        },
        headers: { 'content-type': 'application/json' },
      })
        .its(`body.data.nodes`)
        .then(function (response) {
          let nodes = [];
          response.forEach((node) => {
            nodes.push(node);
          });
          return nodes;
        });
    });
  });
});
