import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';
import { common_switch_to_mobile_and_click_toggle } from '../support/common.functions';

context('Validator page', function () {
  describe('Verify elements on page', function () {
    it('Validator page is displayed', function () {
      cy.visit('/');
      cy.get(navigationLocators.validators).click();
      validateValidatorsDisplayed();
    });

    it('Validator page is displayed on mobile', function () {
      common_switch_to_mobile_and_click_toggle();
      cy.get(navigationLocators.validators).click();
      validateValidatorsDisplayed();
    });

    function validateValidatorsDisplayed() {
      cy.get(commonLocators.tendermintHeader).should(
        'have.text',
        'Tendermint data'
      );
      cy.get(commonLocators.vegaHeader).should('have.text', 'Vega data');
      cy.get(commonLocators.vegaData).should('not.be.empty');
    }
  });
});
