context('Asset page', { tags: '@regression' }, function () {
  before('gather system asset information', function () {
    cy.get_asset_information().as('assetsInfo');
  });

  describe('Verify elements on page', function () {
    const assetsNavigation = 'a[href="/assets"]';
    const assetHeader = '[data-testid="asset-header"]';
    const jsonSection = '.language-json';

    before('Navigate to assets page', function () {
      cy.visit('/');
      cy.get(assetsNavigation).click();

      // Check we have enough enough assets
      const assetNames = Object.keys(this.assetsInfo);
      assert.isAtLeast(
        assetNames.length,
        5,
        'Ensuring we have at least 5 assets to test'
      );
    });

    it('should be able to see assets page sections', function () {
      const assetNames = Object.keys(this.assetsInfo);
      assetNames.forEach((assetName) => {
        cy.get(assetHeader)
          .contains(assetName)
          .should('be.visible')
          .next()
          .within(() => {
            cy.get(jsonSection).should('not.be.empty');
          });
      });
    });

    it('should be able to see all asset details displayed in JSON', function () {
      const assetNames = Object.keys(this.assetsInfo);
      assetNames.forEach((assetName) => {
        cy.get(assetHeader)
          .contains(assetName)
          .next()
          .within(() => {
            cy.get(jsonSection)
              .invoke('text')
              .convert_string_json_to_js_object()
              .then((assetsListedInJson) => {
                const assetInfo = this.assetsInfo[assetName];

                assert.equal(assetsListedInJson.name, assetInfo.node.name);
                assert.equal(assetsListedInJson.id, assetInfo.node.id);
                assert.equal(assetsListedInJson.decimals, assetInfo.node.decimals);
                assert.equal(assetsListedInJson.symbol, assetInfo.node.symbol);
                assert.equal(
                  assetsListedInJson.source.__typename,
                  assetInfo.node.source.__typename
                );

                if (assetInfo.node.source.__typename == 'ERC20') {
                  assert.equal(
                    assetsListedInJson.source.contractAddress,
                    assetInfo.node.source.contractAddress
                  );
                }

                if (assetInfo.node.source.__typename == 'BuiltinAsset') {
                  assert.equal(
                    assetsListedInJson.source.maxFaucetAmountMint,
                    assetInfo.node.source.maxFaucetAmountMint
                  );
                }

                let knownAssetTypes = ['BuiltinAsset', 'ERC20'];
                assert.include(
                  knownAssetTypes,
                  assetInfo.node.source.__typename,
                  `Checking that current asset type of ${assetInfo.node.source.__typename} /
                  is one of: ${knownAssetTypes}: /
                  If fail then we need to add extra tests for un-encountered asset types`
                );
              });
          });
      });
    });

    it('should be able to switch assets between light and dark mode', function () {
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
      cy.get(assetsNavigation)
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
      cy.get(assetsNavigation)
        .should('have.css', 'background-color')
        .and('include', darkThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', darkThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', darkThemeSideMenuBackgroundColor);
    });

    it('should be able to see assets page displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(assetsNavigation).click();

      const assetNames = Object.keys(this.assetsInfo);
      assetNames.forEach((assetName) => {
        cy.get(assetHeader)
          .contains(assetName)
          .should('be.visible')
          .next()
          .within(() => {
            cy.get(jsonSection).should('not.be.empty');
          });
      });
    });
  });
});
