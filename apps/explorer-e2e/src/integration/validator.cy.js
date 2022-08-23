import '../support/common.functions';

context('Validator page', function () {
  describe('Verify elements on page', function () {
    const validatorNavigation = 'a[href="/validators"]';

    it('Validator page is displayed', function () {
      cy.visit('/');
      cy.get(validatorNavigation).click();
      validateValidatorsDisplayed();
    });

    it('Validator page is displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(validatorNavigation).click();
      validateValidatorsDisplayed();
    });

    function validateValidatorsDisplayed() {
      cy.get('[data-testid="tendermint-header"]').should(
        'have.text',
        'Tendermint data'
      );
      cy.get('[data-testid="tendermint-data"]').should('not.be.empty');
    }
  });
});
