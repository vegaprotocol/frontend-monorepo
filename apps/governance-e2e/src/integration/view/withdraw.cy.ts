import {
  navigateTo,
  navigation,
  verifyPageHeader,
  verifyTabHighlighted,
} from '../../support/common.functions';

const connectToVegaBtn = '[data-testid="connect-to-vega-wallet-btn"]';

context(
  'Withdraw Page - verify elements on page',
  { tags: '@smoke' },
  function () {
    before('navigate to withdrawals page', function () {
      cy.visit('/');
      navigateTo(navigation.withdraw);
    });

    describe('with wallets disconnected', function () {
      it('should have withdraw tab highlighted', function () {
        verifyTabHighlighted(navigation.withdraw);
      });

      it('should have WITHDRAW header visible', function () {
        verifyPageHeader('Withdrawals');
      });

      it('should have connect Vega wallet button', function () {
        cy.get(connectToVegaBtn)
          .should('be.visible')
          .and('have.text', 'Connect Vega wallet');
      });
    });
  }
);
