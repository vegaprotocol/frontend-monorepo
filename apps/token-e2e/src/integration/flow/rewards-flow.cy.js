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
    cy.deposit_asset(vegaAssetAddress, '100000000000000000000');
    cy.connectVegaWallet();
    cy.ethereum_wallet_connect();
    cy.get(walletContainer).within(() => {
      cy.get(vegaWalletCurrencyTitle)
        .contains('VEGA', txTimeout)
        .should('be.visible');
    });
  });

  it('Stake tokens and wait for reward', function () {
    topUpRewardsPool();
    cy.navigate_to('validators');
    cy.vega_wallet_teardown();
    cy.staking_page_associate_tokens('4');
    cy.get(vegaWalletUnstakedBalance, txTimeout).should(
      'contain',
      4.0,
      txTimeout
    );
    cy.get('button').contains('Select a validator to nominate').click();

    cy.click_on_validator_from_list(0);
    cy.staking_validator_page_add_stake('2');
    cy.navigate_to('validators');

    cy.click_on_validator_from_list(1);
    cy.staking_validator_page_add_stake('2');

    cy.navigate_to('rewards');
  });

  function topUpRewardsPool() {
    // Must ensure that test wallet contains assets already and that the tests are within the start and end epochs
    cy.exec(
      `vega wallet transaction send --wallet ${Cypress.env(
        'vegaWalletName'
      )} --pubkey ${Cypress.env(
        'vegaWalletPublicKey'
      )} -p "./src/fixtures/wallet/passphrase" --network DV '{"transfer":{"fromAccountType":4,"toAccountType":12,"to":"0000000000000000000000000000000000000000000000000000000000000000","asset":"b4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b","amount":"1000000000000000000","recurring":{"startEpoch":20, "endEpoch": 40, "factor":"1"}}}' --home ${Cypress.env(
        'vegaWalletLocation'
      )}`,
      { failOnNonZeroExit: false }
    )
      .its('stderr')
      .should('contain', '');
  }
});
