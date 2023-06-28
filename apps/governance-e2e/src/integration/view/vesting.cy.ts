import {
  navigateTo,
  navigation,
  verifyPageHeader,
  verifyTabHighlighted,
} from '../../support/common.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';

const connectButton = 'connect-to-eth-btn';
const lockedTokensInVestingContract = '6,499,972.30';

context(
  'Vesting Page - verify elements on page',
  { tags: '@smoke' },
  function () {
    before('navigate to vesting page', function () {
      cy.visit('/');
      navigateTo(navigation.vesting);
    });

    describe('with wallets disconnected', function () {
      it('should have vesting tab highlighted', function () {
        verifyTabHighlighted(navigation.vesting);
      });

      it('should have VESTING header visible', function () {
        verifyPageHeader('Vesting');
      });

      // 1005-VEST-018
      it('should have connect Eth wallet button', function () {
        cy.getByTestId(connectButton)
          .should('be.visible')
          .and('have.text', 'Connect Ethereum wallet');
      });
    });

    describe('With Eth wallet connected', function () {
      before('connect eth wallet', function () {
        ethereumWalletConnect();
        cy.getByTestId('view-connected-eth-btn').click();
      });

      // 1005-VEST-020 1005-VEST-021
      it('Tokens in vesting contract for eth wallet is displayed on wallet window', function () {
        cy.get('[data-testid="vega-in-vesting-contract"]:visible').within(
          () => {
            cy.getByTestId('currency-title')
              .should('contain.text', 'VEGA')
              .and('contain.text', 'In vesting contract');
            cy.get('[data-testid="currency-value"]:visible').should(
              'have.text',
              lockedTokensInVestingContract
            );
            cy.get('[data-testid="currency-locked"]:visible').should(
              'have.text',
              lockedTokensInVestingContract
            );
            cy.get('[data-testid="currency-unlocked"]:visible').should(
              'have.text',
              '0.00'
            );
          }
        );
      });
      // 1005-VEST-022 1005-VEST-023
      it('Tokens amount displayed in vesting page', function () {
        cy.getByTestId(
          'redemption-description',
          Cypress.env('txTimeout')
        ).should('exist');
        const redemptionText =
          'The connected Ethereum wallet (0xEe7D…d94F) has 6,499,972.30 $VEGA tokens in 1 tranche(s) of the vesting contract.';

        cy.getByTestId('redemption-description').should(
          'have.text',
          redemptionText
        );
        cy.getByTestId('vesting-table').within(() => {
          cy.getByTestId('key-value-table-row')
            .eq(0)
            .within(() => {
              cy.get('dt').should('have.text', 'Vesting VEGA');
              cy.get('dd').should('have.text', lockedTokensInVestingContract);
            });
          cy.getByTestId('key-value-table-row')
            .eq(1)
            .within(() => {
              cy.get('dt').should('have.text', 'Locked');
              cy.get('dd').should('have.text', lockedTokensInVestingContract);
            });
          cy.getByTestId('key-value-table-row')
            .eq(2)
            .within(() => {
              cy.get('dt').should('have.text', 'Unlocked');
              cy.get('dd').should('have.text', '0.00');
            });
          cy.getByTestId('key-value-table-row')
            .eq(3)
            .within(() => {
              cy.get('dt').should('have.text', 'Associated');
              cy.get('dd').should('have.text', '0.00');
            });
        });
      });

      // 1005-VEST-024 1005-VEST-025 1005-VEST-026 1005-VEST-036 1005-VEST-037
      it('Tokens locked in individual tranches are displayed', function () {
        cy.getByTestId('tranche-table-footer').should(
          'have.text',
          'All the tokens in this tranche are locked and must be assigned to a tranche before they can be redeemed.'
        );
        cy.getByTestId('tranche-item').within(() => {
          cy.get('a')
            .should('have.text', 'Tranche 0')
            .and('have.attr', 'href', '/token/tranches/0');
          cy.get('span')
            .eq(1)
            .should('have.text', lockedTokensInVestingContract);
          cy.contains('Unlocking starts') // 1005-VEST-008
            .parent()
            .should('contain.text', '01 Jan 1970');
          cy.contains('Fully unlocked')
            .parent()
            .should('contain.text', '01 Jan 1970');
          cy.getByTestId('progress-bar').should('exist');
          cy.getByTestId('currency-locked') // 1005-VEST-006
            .should('have.text', lockedTokensInVestingContract);
          cy.getByTestId('currency-unlocked') // 1005-VEST-007
            .invoke('text')
            .should('not.be.empty');
          cy.getByTestId('tranche-item-footer').should(
            'have.text',
            'All the tokens in this tranche are locked and can not be redeemed yet.'
          );
        });
      });
    });
  }
);
