context('Governance flow - with eth and vega wallets connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.verify_page_header('The $VEGA token');
    cy.vega_wallet_connect();
    cy.ethereum_wallet_connect();
    cy.navigate_to('staking');
    cy.wait_for_spinner();
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    beforeEach(
      'teardown wallet & drill into a specific validator',
      function () {
        // cy.vega_wallet_teardown();
        cy.navigate_to('staking');
        cy.wait_for_spinner();
        // cy.staking_page_associate_tokens('2');
      }
    );

    it('Able to create a freeform proposal', function () {
      cy.vega_wallet_create_proposal_freeform('15').as(
        'proposalUniqueIdentifier'
      );
      cy.get('@proposalUniqueIdentifier').then((thisthing) => {
        cy.log(thisthing);
      });
    });
  });
});
