const withdraw = 'withdraw';
const selectAsset = 'select-asset';
const ethAddressInput = 'eth-address-input';
const amountInput = 'amount-input';

context(
  'Withdrawals - with eth and vega wallet connected',
  { tags: '@slow' },
  function () {
    before('visit withdrawals and connect vega wallet', function () {
      cy.vega_wallet_import();
      cy.visit('/');
      cy.navigate_to('withdrawals');
      cy.vega_wallet_connect();
    });

    it('Able to open withdrawal form with vega wallet connected', function () {
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(selectAsset)
        .find('option')
        .should('have.length.at.least', 5);
      cy.getByTestId(ethAddressInput).should('be.visible');
      cy.getByTestId(amountInput).should('be.visible');
    });
  }
);
