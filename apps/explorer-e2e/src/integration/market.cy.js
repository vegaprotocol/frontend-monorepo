import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';
import '../support/common.functions';

//Tests set to skip until market bug for capsule checkpoint is fixed
context.skip('Market page', function () {
  describe('Verify elements on page', function () {
    it('Markets page is displayed', function () {
      cy.visit('/');
      cy.get(navigationLocators.markets).click();
      cy.common_validate_blocks_data_displayed(commonLocators.marketHeaders);
    });

    it('Markets page displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(navigationLocators.markets).click();
      cy.common_validate_blocks_data_displayed(commonLocators.marketHeaders);
    });
  });
});
