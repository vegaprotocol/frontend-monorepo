/// <reference types="cypress" />
const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey2');
const vegaPubkeyTruncated = Cypress.env('vegaWalletPublicKey2Short');
const banner = 'view-banner';

context('View functionality with public key', { tags: '@smoke' }, function () {
  before('send asset to wallet', function () {
    cy.vega_wallet_faucet_assets_without_check(
      'fUSDC',
      '1000000',
      vegaWalletPubKey
    );
  });

  beforeEach('visit home page', function () {
    cy.visit('/');
    cy.wait_for_spinner();
    cy.connectPublicKey(vegaWalletPubKey);
  });

  it('Able to connect public key via wallet', function () {
    verifyConnectedToPubKey();
    cy.getByTestId('currency-title').should('contain.text', 'USDC (fake)');
  });

  it('Able to connect public key using url', function () {
    cy.getByTestId('exit-view').click();
    cy.visit(`/?address=${vegaWalletPubKey}`);
    verifyConnectedToPubKey();
  });

  it('Unable to submit proposal with public key', function () {
    const expectedErrorTxt = `You are connected in a view only state for public key: ${vegaWalletPubKey}. In order to send transactions you must connect to a real wallet.`;

    cy.navigate_to('proposals');
    cy.go_to_make_new_proposal('Freeform');
    cy.enter_unique_freeform_proposal_body('50', 'pub key proposal test');
    cy.getByTestId('proposal-submit').should('be.visible').click();
    cy.getByTestId('dialog-content').within(() => {
      cy.get('h1').should('have.text', 'Transaction failed');
      cy.getByTestId('Error').should('have.text', expectedErrorTxt);
    });
  });

  it('Able to disconnect via banner', function () {
    cy.getByTestId('exit-view').click();
    cy.getByTestId(banner).should('not.exist');
  });

  it('Able to disconnect via wallet', function () {
    cy.getByTestId('manage-vega-wallet').click();
    cy.getByTestId('disconnect').click();
    cy.getByTestId(banner).should('not.exist');
  });

  function verifyConnectedToPubKey() {
    cy.getByTestId(banner).should(
      'contain.text',
      `Viewing as Vega user: ${vegaPubkeyTruncated}`
    );
  }
});
