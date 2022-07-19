const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const txTimeout = Cypress.env('txTimeout');

context('Governance flow - with eth and vega wallets connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.verify_page_header('The $VEGA token');
    cy.vega_wallet_connect();

    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.reload();
    cy.verify_page_header('The $VEGA token');

    cy.ethereum_wallet_connect();
    cy.navigate_to('staking');
    cy.wait_for_spinner();
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    beforeEach(
      'teardown wallet & drill into a specific validator',
      function () {
        cy.vega_wallet_teardown();
        cy.navigate_to('staking');
        cy.wait_for_spinner();
        cy.staking_page_associate_tokens('2');
      }
    );

    it('Able to create a freeform proposal', function () {
      cy.vega_wallet_create_proposal_freeform('15')
      .then((proposal) => {
        expect(proposal).to.have.text(
          'party has insufficient tokens to submit proposal request in this epoch');
      });
    });

    it('Unable to create a freeform proposal without tokens associated', function () {
      cy.staking_page_disassociate_all_tokens();

      cy.get(vegaWalletAssociatedBalance, txTimeout).should(
        'contain',
        '0.000000000000000000',
        txTimeout
      );

      cy.vega_wallet_create_proposal_freeform('15')
        .then((proposal) => {
          expect(proposal).to.have.text(
            'party has insufficient tokens to submit proposal request in this epoch');
        });
    });
  });
});
