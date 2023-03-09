const viewToggle = '[data-testid="epoch-reward-view-toggle-total"]';
const warning = '[data-testid="callout"]';

context(
  'Rewards Page - verify elements on page',
  { tags: '@regression' },
  function () {
    before('navigate to rewards page', function () {
      cy.visit('/').navigate_to('rewards');
    });

    describe('with wallets disconnected', function () {
      it('should have REWARDS tab highlighted', function () {
        cy.verify_tab_highlighted('rewards');
      });

      it('should have rewards header visible', function () {
        cy.verify_page_header('Rewards and fees');
      });

      it('should have epoch warning', function () {
        cy.get(warning)
          .should('be.visible')
          .and(
            'have.text',
            'Rewards are credited 5 minutes after the epoch ends.This delay is set by a network parameter'
          );
      });

      it('should have toggle for seeing total vs individual rewards', function () {
        cy.get(viewToggle).should('be.visible');
      });
    });
  }
);
