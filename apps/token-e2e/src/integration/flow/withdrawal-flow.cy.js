const withdraw = 'withdraw';
const selectAsset = 'select-asset';
const ethAddressInput = 'eth-address-input';
const amountInput = 'amount-input';
const UsdcEthAddress = '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0';

context(
  'Withdrawals - with eth and vega wallet connected',
  { tags: '@slow' },
  function () {
    before('visit withdrawals and connect vega wallet', function () {
      // cy.updateCapsuleMultiSig(); // When running tests locally, will fail if run without restarting capsule
      cy.vega_wallet_import();
      cy.deposit_asset(UsdcEthAddress);
      cy.visit('/');
      cy.navigate_to('withdrawals');
      cy.vega_wallet_connect();
      cy.ethereum_wallet_connect();
    });

    beforeEach('Navigate to withdrawal page', function () {
      cy.visit('/');
      cy.navigate_to('withdrawals');
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
