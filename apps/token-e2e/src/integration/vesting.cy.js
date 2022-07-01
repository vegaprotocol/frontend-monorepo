import navigation from '../locators/navigation.locators';
import vesting from '../locators/vesting.locators';

context('Vesting Page - verify elements on page', function () {
  before('navigate to vesting page', function () {
    cy.visit('/')
      .get(navigation.section)
      .within(() => {
        cy.get(navigation.vesting).click();
      });
  });

  describe('with wallets disconnected', function () {
    it('should have vesting tab highlighted', function () {
      cy.get(navigation.section).within(() => {
        cy.get(navigation.vesting).should('have.attr', 'aria-current');
      });
    });

    it('should have VESTING header visible', function () {
      cy.get(vesting.pageHeader)
        .should('be.visible')
        .and('have.text', 'Vesting');
    });

    it('should have connect Eth wallet info', function () {
      cy.get(vesting.connectPrompt).should('be.visible');
    });

    it('should have connect Eth wallet button', function () {
      cy.get(vesting.connectButton)
        .should('be.visible')
        .and('have.text', 'Connect Ethereum wallet');
    });
  });
});
