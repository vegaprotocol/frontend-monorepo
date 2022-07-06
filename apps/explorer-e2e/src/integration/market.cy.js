import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';
import '../support/common.functions';

//Tests set to skip until market bug for capsule checkpoint is fixed
context.skip(
  'Market page - verify elements on page',
  { tags: '@ignore' },
  function () {
    before('visit token home page', function () {
      cy.visit('/');
    });

    describe('Markets page', function () {
      beforeEach('navigate to markets page', function () {
        cy.get(navigationLocators.markets).click();
      });

      it('Markets page is displayed', function () {
        cy.common_validate_blocks_data_displayed(commonLocators.marketHeaders);
      });

      it('Markets page displayed on mobile', function () {
        cy.common_switch_to_mobile_and_click_toggle();
        cy.get(navigationLocators.markets).click();
        cy.common_validate_blocks_data_displayed(commonLocators.marketHeaders);
      });
    });
  }
);
