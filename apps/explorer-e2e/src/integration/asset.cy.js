import '../support/common.functions';

context('Asset page', function () {
  describe('Verify elements on page', function () {
    const assetsNavigation = 'a[href="/assets"]';
    const assetHeader = '[data-testid="asset-header"]';

    it('Assets page is displayed', function () {
      cy.visit('/');
      cy.get(assetsNavigation).click();
      cy.common_validate_blocks_data_displayed(assetHeader);
    });

    it('Assets page displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(assetsNavigation).click();
      cy.common_validate_blocks_data_displayed(assetHeader);
    });
  });
});
