import navigation from '../locators/navigation.locators';
import staking from '../locators/staking.locators';

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/')
      .get(navigation.section)
      .within(() => {
        cy.get(navigation.staking).click();
      });
  });

  describe('Staking page', function () {
    it('should have staking tab highlighted', function () {
      cy.get(navigation.section).within(() => {
        cy.get(navigation.staking).should('have.attr', 'aria-current');
      });
    });
  });

  describe('description section', function () {
    it('should have STAKING header visible', function () {
      cy.get(staking.pageHeader)
        .should('be.visible')
        .and('have.text', 'Staking');
    });

    it('should have description section visible', function () {
      cy.get(staking.stakingDescription)
        .should('be.visible')
        .and('have.text', 'How does staking on Vega work?');
    });

    it('should have Staking Guide link visible', function () {
      cy.get(staking.guideLink)
        .should('be.visible')
        .and('have.text', 'Read more about staking on Vega')
        .and(
          'have.attr',
          'href',
          'https://docs.vega.xyz/docs/mainnet/concepts/vega-chain/#staking-on-vega'
        );
    });
  });

  describe('validators section', function () {
    it('should have header visible', function () {
      cy.get(staking.stakingIntro).within(() => {
        cy.get(staking.sectionHeader)
          .should('be.visible')
          .and(
            'have.text',
            "Step 3. Select the validator you'd like to nominate"
          );
      });
    });
  });
});
