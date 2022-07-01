import navigation from '../locators/navigation.locators';
import rewards from '../locators/rewards.locators';

context('Rewards Page - verify elements on page', function () {
  before('navigate to rewards page', function () {
    cy.visit('/')
      .get(navigation.section)
      .within(() => {
        cy.get(navigation.rewards).click();
      });
  });

  describe('with wallets disconnected', function () {
    it('should have REWARDS tab highlighted', function () {
      cy.get(navigation.section).within(() => {
        cy.get(navigation.rewards).should('have.attr', 'aria-current');
      });
    });

    it('should have rewards header visible', function () {
      cy.get(rewards.pageHeader)
        .should('be.visible')
        .and('have.text', 'Rewards');
    });

    it('should have epoch warning', function () {
      cy.get(rewards.warning)
        .should('be.visible')
        .and(
          'have.text',
          'Rewards are credited 5 minutes after the epoch ends.This delay is set by a network parameter'
        );
    });

    it('should have connect Vega wallet button', function () {
      cy.get(rewards.connectToVegaBtn)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });
  });
});
