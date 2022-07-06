import navigation from '../locators/navigation.locators';
import withdraw from '../locators/withdraw.locators';

context('Withdraw Page - verify elements on page', function () {
  before('navigate to withdraw page', function () {
    cy.visit('/')
      .get(navigation.section)
      .within(() => {
        cy.get(navigation.withdraw).click();
      });
  });

  describe('with wallets disconnected', function () {
    it('should have withdraw tab highlighted', function () {
      cy.get(navigation.section).within(() => {
        cy.get(navigation.withdraw).should('have.attr', 'aria-current');
      });
    });

    it('should have WITHDRAW header visible', function () {
      cy.get(withdraw.pageHeader)
        .should('be.visible')
        .and('have.text', 'Withdraw');
    });

    it('should have connect Vega wallet button', function () {
      cy.get(withdraw.connectToVegaBtn)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });

    it('should have withdraw information box', function () {
      cy.get(withdraw.warning).should('be.visible');
    });
  });
});
