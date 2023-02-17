context('Network parameters page', { tags: '@smoke' }, function () {
  before('navigate to network parameter page', function () {
    cy.fixture('net_parameter_format_lookup').as('networkParameterFormat');
  });

  describe('Verify elements on page', function () {
    const networkParametersNavigation = 'a[href="/network-parameters"]';
    const networkParametersHeader = '[data-testid="network-param-header"]';
    const tableRows = '[data-testid="key-value-table-row"]';

    before('navigate to network parameter page', function () {
      cy.visit('/');
      cy.get(networkParametersNavigation).click();
    });

    it('should show network parameter heading at top of page', function () {
      cy.get(networkParametersHeader)
        .should('have.text', 'Network Parameters')
        .and('be.visible');
    });

    it('should list each of the network parameters available', function () {
      cy.get_network_parameters().then((network_parameters) => {
        const numberOfNetworkParametersInSystem =
          Object.keys(network_parameters).length;
        cy.get(tableRows).should(
          'have.length',
          numberOfNetworkParametersInSystem
        );
      });
    });

    it('should list each network parameter displayed with json - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (this.networkParameterFormat.json.includes(parameterName)) {
            cy.get(tableRows)
              .contains(parameterName)
              .should('be.visible')
              .next()
              .invoke('text')
              .convert_string_json_to_js_object()
              .then((jsonOnPage) => {
                cy.wrap(parameterValue, { log: false })
                  .convert_string_json_to_js_object()
                  .then((jsonInSystem) =>
                    assert.deepEqual(
                      jsonOnPage,
                      jsonInSystem,
                      `Checking ${parameterName} has the correct value of ${jsonInSystem}`
                    )
                  );
              });
          }
        });
      });
    });

    it('should list each network parameter displayed as a percentage - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (this.networkParameterFormat.percentage.includes(parameterName)) {
            const formattedPercentageParameter =
              (parseFloat(parameterValue) * 100).toFixed(0) + '%';
            cy.get(tableRows)
              .contains(parameterName)
              .should('be.visible')
              .next()
              .invoke('text')
              .then((parameterValueOnPage) => {
                assert.equal(
                  parameterValueOnPage,
                  formattedPercentageParameter,
                  `Checking ${parameterName} has the correct value of ${formattedPercentageParameter}`
                );
                cy.contains(parameterValueOnPage).should('be.visible');
              });
          }
        });
      });
    });

    it('should list each network parameter displayed as an id - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (this.networkParameterFormat.id.includes(parameterName)) {
            cy.get(tableRows)
              .contains(parameterName)
              .should('be.visible')
              .next()
              .should('contain', parameterValue)
              .and('be.visible')
              .invoke('text');
          }
        });
      });
    });

    it('should list each network parameter displayed as a date - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (this.networkParameterFormat.date.includes(parameterName)) {
            cy.get(tableRows)
              .contains(parameterName)
              .should('be.visible')
              .next()
              .should('contain', parameterValue)
              .and('be.visible');
          }
        });
      });
    });

    it('should list each network parameter displayed as a duration - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (this.networkParameterFormat.duration.includes(parameterName)) {
            cy.get(tableRows)
              .contains(parameterName)
              .should('be.visible')
              .next()
              .should('contain', parameterValue)
              .and('be.visible');
          }
        });
      });
    });

    it('should list each network parameter displayed as a currency value with four decimals - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (this.networkParameterFormat.fiveDecimal.includes(parameterName)) {
            cy.convert_number_to_max_four_decimal(parameterValue)
              .add_commas_to_number_if_large_enough()
              .then((parameterValueFormatted) => {
                cy.get(tableRows)
                  .contains(parameterName)
                  .should('be.visible')
                  .next()
                  .invoke('text')
                  .then((parameterValueOnPage) => {
                    assert.equal(
                      parameterValueOnPage,
                      parameterValueFormatted,
                      `Checking ${parameterName} has the correct value of ${parameterValueFormatted}`
                    );
                    cy.contains(parameterValueOnPage).should('be.visible');
                  });
              });
          }
        });
      });
    });

    it('should list each network parameter displayed as a currency value with eighteen decimals - in the correct format', function () {
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          const parameterValue = network_parameter[1];
          if (
            this.networkParameterFormat.eighteenDecimal.includes(parameterName)
          ) {
            cy.convert_number_to_max_eighteen_decimal(parameterValue)
              .add_commas_to_number_if_large_enough()
              .then((parameterValueFormatted) => {
                cy.get(tableRows)
                  .contains(parameterName)
                  .should('be.visible')
                  .next()
                  .invoke('text')
                  .then((parameterValueOnPage) => {
                    assert.equal(
                      parameterValueOnPage,
                      parameterValueFormatted,
                      `Checking ${parameterName} has the correct value of ${parameterValueFormatted}`
                    );
                    cy.contains(parameterValueOnPage).should('be.visible');
                  });
              });
          }
        });
      });
    });

    it('should be able to switch network parameter page - between light and dark mode', function () {
      const whiteThemeSelectedMenuOptionColor = 'rgb(255, 7, 127)';
      const whiteThemeJsonFieldBackColor = 'rgb(255, 255, 255)';
      const whiteThemeSideMenuBackgroundColor = 'rgb(255, 255, 255)';
      const darkThemeSelectedMenuOptionColor = 'rgb(215, 251, 80)';
      const darkThemeJsonFieldBackColor = 'rgb(38, 38, 38)';
      const darkThemeSideMenuBackgroundColor = 'rgb(0, 0, 0)';
      const themeSwitcher = '[data-testid="theme-switcher"]';
      const jsonFields = '.hljs';
      const sideMenuBackground = '.absolute';

      // Engage dark mode if not already set
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .then((background_color) => {
          if (background_color.includes(whiteThemeSideMenuBackgroundColor))
            cy.get(themeSwitcher).click();
        });

      // Engage white mode
      cy.get(themeSwitcher).click();

      // White Mode
      cy.get(networkParametersNavigation)
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
      cy.get(networkParametersNavigation)
        .should('have.css', 'background-color')
        .and('include', darkThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', darkThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', darkThemeSideMenuBackgroundColor);
    });

    it.skip('should be able to see network parameters - on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(networkParametersNavigation).click();
      cy.get_network_parameters().then((network_parameters) => {
        network_parameters = Object.entries(network_parameters);
        network_parameters.forEach((network_parameter) => {
          const parameterName = network_parameter[0];
          cy.get(tableRows)
            .contains(parameterName)
            .should('be.visible')
            .next()
            .should('not.be.empty')
            .and('be.visible');
        });
      });
    });
  });
});
