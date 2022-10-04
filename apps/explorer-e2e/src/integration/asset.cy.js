context('Asset page', { tags: '@regression' }, function () {
  describe('Verify elements on page', function () {
    const assetsNavigation = 'a[href="/assets"]';
    const assetHeader = '[data-testid="asset-header"]';
    const jsonSection = '.language-json';

    before('Navigate to assets page', function () {
      cy.visit('/');
      cy.get(assetsNavigation).click();
    });

    it('Assets page is displayed', function () {
      cy.common_validate_blocks_data_displayed(assetHeader);
    });

    it('Assets and all asset details are displayed in JSON', function () {
      cy.get_asset_information().then((assetsInfo) => {
        const assetNames = Object.keys(assetsInfo);
        assert.isAtLeast(
          assetNames.length,
          3,
          'Ensuring we have at least 3 assets to test'
        );
      
        assetNames.forEach((assetName) => {
          cy.get(assetHeader)
            .contains(assetName)
            .next()
            .within(() => {
              cy.get(jsonSection)
                .invoke('text')
                .convert_string_json_to_js_object()
                .then((assetsListedInJson) => {

                  const assetInfo = assetsInfo[assetName];

                  assert.equal(
                    assetsListedInJson.name,
                    assetInfo.name
                  );
                  assert.equal(
                    assetsListedInJson.id,
                    assetInfo.id
                  );
                  assert.equal(
                    assetsListedInJson.decimals,
                    assetInfo.decimals
                  );
                  assert.equal(
                    assetsListedInJson.symbol,
                    assetInfo.symbol
                  );
                  assert.equal(
                    assetsListedInJson.source.__typename,
                    assetInfo.source.__typename
                  );

                  if (assetInfo.source.__typename == 'ERC20') {
                    assert.equal(
                        assetsListedInJson.source.contractAddress,
                        assetInfo.source.contractAddress
                    );
                  }
  
                  if (assetInfo.source.__typename == 'BuiltinAsset') {
                    assert.equal(
                      assetsListedInJson.source.maxFaucetAmountMint,
                      assetInfo.source.maxFaucetAmountMint
                  );
                  }
  
                  let knownAssetTypes = ['BuiltinAsset', 'ERC20'];
                  assert.include(
                    knownAssetTypes,
                    assetInfo.source.__typename,
                    `Checking that current asset type of ${assetInfo.source.__typename} /
                  is one of: ${knownAssetTypes}: /
                  If fail then we need to add extra tests for un-encountered asset types`
                  );
                });
            })
        });
      })
    });

    it('Assets page able to switch between light and dark mode', function () {
      const whiteThemeSelectedMenuOptionColor = 'rgb(255, 7, 127)';
      const whiteThemeJsonFieldBackColor = 'rgb(255, 255, 255)';
      const whiteThemeSideMenuBackgroundColor = 'rgb(255, 255, 255)';
      const blackThemeSelectedMenuOptionColor = 'rgb(223, 255, 11)';
      const blackThemeJsonFieldBackColor = 'rgb(38, 38, 38)';
      const blackThemeSideMenuBackgroundColor = 'rgb(0, 0, 0)';
      const themeSwitcher = '[data-testid="theme-switcher"]';
      const jsonFields = '.hljs';
      const sideMenuBackground = '.absolute';

      // White Mode
      cy.get(themeSwitcher).click();
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
        .and('include', blackThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', blackThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', blackThemeSideMenuBackgroundColor);
    });

    it('Assets page displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(assetsNavigation).click();
      cy.common_validate_blocks_data_displayed(assetHeader);
    });
  });
});
