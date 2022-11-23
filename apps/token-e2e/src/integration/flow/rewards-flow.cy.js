const vegaWalletCurrencyTitle = '[data-testid="currency-title"]';
const walletContainer = '[data-testid="ethereum-wallet"]';
const vegaAssetAddress = '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const txTimeout = Cypress.env('txTimeout');

context('rewards - flow', { tags: '@slow' }, function () {
  before('set up', function () {
    cy.visit('/');
    cy.verify_page_header('The $VEGA token');
    cy.vega_wallet_set_specified_approval_amount('1000');
    // cy.updateCapsuleMultiSig();
    cy.deposit_asset(vegaAssetAddress);
    cy.vega_wallet_connect();
    cy.ethereum_wallet_connect();
    cy.get(walletContainer).within(() => {
      cy.get(vegaWalletCurrencyTitle)
        .contains('VEGA', txTimeout)
        .should('be.visible');
    });
  });

  it('Stake tokens and wait for reward', function () {
    cy.exec(
      `vega wallet command send --wallet ${Cypress.env(
        'vegaWalletName'
      )} --pubkey ${Cypress.env(
        'vegaWalletPublicKey'
      )} --network DV '{"transfer":{"fromAccountType":4,"toAccountType":12,"to":"0000000000000000000000000000000000000000000000000000000000000000","asset":"993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede","amount":"100000","recurring":{"startEpoch":1, "endEpoch": 100000000, "factor":"1"}}}' --home ${Cypress.env(
        'vegaWalletLocation'
      )}`,
      { failOnNonZeroExit: false }
    )
      .its('stderr')
      .should('contain', '');
    cy.navigate_to('staking');
    cy.wait_for_spinner();
    cy.staking_page_associate_tokens('3');
    cy.get(vegaWalletUnstakedBalance, txTimeout).should(
      'contain',
      3.0,
      txTimeout
    );
    cy.get('button').contains('Select a validator to nominate').click();

    cy.click_on_validator_from_list(0);

    cy.staking_validator_page_add_stake('2');
    cy.navigate_to('rewards');
  });
});
