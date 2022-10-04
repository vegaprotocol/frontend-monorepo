context('Asset page', { tags: '@regression' }, function () {
  describe('Verify elements on page', function () {
    const assetsNavigation = 'a[href="/assets"]';
    const assetHeader = '[data-testid="asset-header"]';
    const jsonSection = '.language-json';

    before('navigate to parties page and search for party', function () {
      cy.visit('/');
      cy.get(assetsNavigation).click();
    });

    it('Assets page is displayed', function () {
      cy.common_validate_blocks_data_displayed(assetHeader);
    });

    it('Assets and all asset details are displayed', function () {
      cy.get_asset_information().then((assetsInfo) => {
        const assetNames = Object.keys(assetsInfo);
        assert.isAtLeast(assetNames.length, 3, 'Ensuring we have at least 3 assets to test');
        assetNames.forEach((assetName) => {
          const assetInfo = assetsInfo[assetName];
          cy.get(assetHeader).contains(assetInfo.symbol);
          cy.get(assetHeader).contains(assetName).next().within(() => {
            cy.get(jsonSection).within(() => {
              cy.contains(`"name": "${assetName}"`)
                .should('be.visible');
              cy.contains(`"id": "${assetInfo.id}"`)
                .should('be.visible');
              cy.contains(`"decimals": ${assetInfo.decimals}`)
                .should('be.visible');
              cy.contains(`"symbol": "${assetInfo.symbol}"`)
                .should('be.visible');
              cy.contains(`"__typename": "${assetInfo.infrastructureFeeAccount.__typename}"`)
                .should('be.visible');
              cy.contains(`"type": "${assetInfo.infrastructureFeeAccount.type}"`)
                .should('be.visible');
              cy.contains(`"balance": "${assetInfo.infrastructureFeeAccount.balance}"`)
                .should('be.visible');
              cy.contains(`"__typename": "${assetInfo.source.__typename}"`)
                .should('be.visible')

              if (assetInfo.source.__typename == 'ERC20') {
                cy.contains(`"contractAddress": "${assetInfo.source.contractAddress}"`)
                  .should('be.visible');
              }

              if (assetInfo.source.__typename == 'BuiltinAsset') {
                cy.contains(`"maxFaucetAmountMint": "${assetInfo.source.maxFaucetAmountMint}"`)
                  .should('be.visible');
              }

              let knownAssetTypes = ['BuiltinAsset','ERC20'];
              assert.include(knownAssetTypes, assetInfo.source.__typename, 
                `Checking that current asset type of ${assetInfo.source.__typename} /
                is one of: ${knownAssetTypes}: /
                If fail then we need to add extra tests for un-encountered asset types`);
           
            })
          })
        });
      });
    })

    it('Assets page able to switch between light and dark mode', function () {
      const whiteThemeSelectedMenuOptionColor = 'rgb(255, 7, 127)'
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
      cy.get(jsonFields).should('have.css', 'background-color')
        .and('include', whiteThemeJsonFieldBackColor);
      cy.get(sideMenuBackground).should('have.css', 'background-color')
        .and('include', whiteThemeSideMenuBackgroundColor);
      
      // Dark Mode
      cy.get(themeSwitcher).click();
      cy.get(assetsNavigation)
        .should('have.css', 'background-color')
        .and('include', blackThemeSelectedMenuOptionColor);
      cy.get(jsonFields).should('have.css', 'background-color')
        .and('include', blackThemeJsonFieldBackColor);
      cy.get(sideMenuBackground).should('have.css', 'background-color')
        .and('include', blackThemeSideMenuBackgroundColor);
    });

    it('Assets page displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(assetsNavigation).click();
      cy.common_validate_blocks_data_displayed(assetHeader);
    });
  });
});
