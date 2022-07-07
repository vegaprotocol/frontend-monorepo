import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';
import {
  common_switch_to_mobile_and_click_toggle,
  common_validate_blocks_data_displayed,
} from '../support/common.functions';

context('Asset page', function () {
  describe('Verify elements on page', function () {
    it('Assets page is displayed', function () {
      cy.visit('/');
      cy.get(navigationLocators.assets).click();
      common_validate_blocks_data_displayed(commonLocators.assetHeader);
    });

    it('Assets page displayed in mobile', function () {
      common_switch_to_mobile_and_click_toggle();
      cy.get(navigationLocators.assets).click();
      common_validate_blocks_data_displayed(commonLocators.assetHeader);
    });
  });
});
