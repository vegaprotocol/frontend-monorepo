import '../support/common.functions';

context('Network parameters page', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('Verify elements on page', function () {
    const networkParametersNavigation = 'a[href="/network-parameters"]';

    beforeEach('Navigate to network parameter page', function () {
      cy.get(networkParametersNavigation).click();
    });

    it('Network paremeter page is displayed', function () {
      verifyNetworkParametersPageDisplayed();
    });

    it('Network parameter page displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(networkParametersNavigation).click();
      verifyNetworkParametersPageDisplayed();
    });
  });

  function verifyNetworkParametersPageDisplayed() {
    cy.get('[data-testid="network-param-header"]').should(
      'have.text',
      'Network Parameters'
    );
    cy.common_verify_json_parameters(18);
    cy.common_verify_json_string_values(6);
    cy.common_verify_json_int_values(7);
  }
});
