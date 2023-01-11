const vegaWalletCurrencyTitle = '[data-testid="currency-title"]';
const walletContainer = '[data-testid="ethereum-wallet"]';
const vegaAssetAddress = '0x67175Da1D5e966e40D11c4B2519392B2058373de';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const txTimeout = Cypress.env('txTimeout');

context('rewards - flow', { tags: '@slow' }, function () {
  before('set up', function () {
    cy.visit('/');
    cy.wait_for_spinner();
    cy.vega_wallet_set_specified_approval_amount('1000');
    // cy.updateCapsuleMultiSig();
    cy.deposit_asset(vegaAssetAddress);
    cy.connectVegaWallet();
    cy.ethereum_wallet_connect();
    cy.get(walletContainer).within(() => {
      cy.get(vegaWalletCurrencyTitle)
        .contains('VEGA', txTimeout)
        .should('be.visible');
    });
  });

  it('Stake tokens and wait for reward', function () {
    cy.exec(
      `vega wallet transaction send --wallet ${Cypress.env(
        'vegaWalletName'
      )} --pubkey ${Cypress.env(
        'vegaWalletPublicKey'
      )} -p "../../../../../vegacapsule/.passphrase" --network DV '{"transfer":{"fromAccountType":4,"toAccountType":12,"to":"0000000000000000000000000000000000000000000000000000000000000000","asset":"b4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b","amount":"100000","recurring":{"startEpoch":1, "endEpoch": 100000000, "factor":"1"}}}' --home ${Cypress.env(
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
