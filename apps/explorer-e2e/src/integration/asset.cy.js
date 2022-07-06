import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';
import '../support/common.functions';

context('Asset page - verify elements on page', function () {
  describe('Asset page', function () {
    it('Assets page is displayed', function () {
      cy.visit('/');
      cy.get(navigationLocators.assets).click();
      cy.common_validate_blocks_data_displayed(commonLocators.assetHeader);
    });

    it('Assets page displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(navigationLocators.assets).click();
      cy.common_validate_blocks_data_displayed(commonLocators.assetHeader);
    });
  });
});
