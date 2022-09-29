const vegaWalletPublicKey = Cypress.env('vegaWalletPublicKey');
const partiesMenuHeader = 'a[href="/parties"]';
const partiesSearchBox = '[data-testid="party-input"]';
const partiesSearchAction = '[data-testid="go-submit"]';
const txTimeout = Cypress.env('txTimeout');

context('Parties page', { tags: '@regression' }, function () {

  before('send-faucet assets to connected vega wallet', function () {
    cy.vega_wallet_import()
    cy.vega_wallet_receive_fauceted_asset(
      'USDC (fake)',
      '10',
      vegaWalletPublicKey
    );
    cy.vega_wallet_receive_fauceted_asset(
      'BTC (fake)',
      '6',
      vegaWalletPublicKey
    );
    cy.vega_wallet_receive_fauceted_asset(
      'EURO (fake)',
      '8',
      vegaWalletPublicKey
    );
    cy.vega_wallet_receive_fauceted_asset(
      'DAI (fake)',
      '2',
      vegaWalletPublicKey
    );
    cy.visit('/');
  });

  describe('Verify parties page content', function () {

    before('navigate to parties page and search for party', function () {
      cy.get(partiesMenuHeader).click();
      // Deliberate slow entry of party id/key - enabling transactions to sync
      cy.get(partiesSearchBox).type(vegaWalletPublicKey, { delay: 100 });
      cy.get(partiesSearchAction).click();
    });

    it('should see party address id - having searched', function () {
      cy.contains('Address')
        .siblings()
        .contains(vegaWalletPublicKey)
        .should('be.visible')
    });

    it('should see fUSDC asset - within asset data section', function () {
      let currency = { id: 'fUSDC', name: 'USDC (fake)' };
      cy.contains(currency.name, txTimeout)
        .should('be.visible');
      cy.contains(currency.name)
        .siblings()
        .contains(currency.id)
        .should('be.visible');
      cy.contains(currency.name, txTimeout)
        .parent()
        .siblings()
        .within(() => cy.contains_exactly('10.00000').should('be.visible'));
    });

    it('should see fBTC assets - within asset data section', function () {
      let currency = { id: 'fBTC', name: 'BTC (fake)' };
      cy.contains(currency.name, txTimeout)
        .should('be.visible');
      cy.contains(currency.name)
        .siblings()
        .contains(currency.id)
        .should('be.visible');
      cy.contains(currency.name, txTimeout)
        .parent()
        .siblings()
        .within(() => cy.contains_exactly('6.00000').should('be.visible'));
    });

    it('should see fEURO assets - within asset data section', function () {
      let currency = { id: 'fEURO', name: 'EURO (fake)' };
      cy.contains(currency.name, txTimeout)
        .should('be.visible');
      cy.contains(currency.name)
        .siblings()
        .contains(currency.id)
        .should('be.visible');
      cy.contains(currency.name, txTimeout)
        .parent()
        .siblings()
        .within(() => cy.contains_exactly('8.00000').should('be.visible'));
    });

    it('should see fDAI assets - within asset data section', function () {
      let currency = { id: 'fDAI', name: 'DAI (fake)' };
      cy.contains(currency.name, txTimeout)
        .should('be.visible');
      cy.contains(currency.name)
        .siblings()
        .contains(currency.id)
        .should('be.visible');
      cy.contains(currency.name, txTimeout)
        .parent()
        .siblings()
        .within(() => cy.contains_exactly('2.00000').should('be.visible'));
    });

    after(
      'teardown environment to prevent test data bleeding into other tests',
      function () {
        if (Cypress.env('CYPRESS_TEARDOWN_NETWORK_AFTER_FLOWS')) {
          cy.restart_vegacapsule_network();
        }
      }
    );
  })
});
