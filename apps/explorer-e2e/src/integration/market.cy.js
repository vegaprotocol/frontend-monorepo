//Tests set to skip until market bug for capsule checkpoint is fixed
context.skip('Market page', { tags: '@regression' }, function () {
  describe('Verify elements on page', function () {
    const marketHeaders = '[data-testid="markets-header"]';
    const marketNavigation = 'a[href="/markets"]';

    it('Markets page is displayed', function () {
      cy.visit('/');
      cy.get(marketNavigation).click();
      cy.common_validate_blocks_data_displayed(marketHeaders);
    });

    it('Markets page displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(marketNavigation).click();
      cy.common_validate_blocks_data_displayed(marketHeaders);
    });
  });
});
