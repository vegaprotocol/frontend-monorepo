const vegaAssetAddress = '0x67175Da1D5e966e40D11c4B2519392B2058373de';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const rewardsTable = 'epoch-total-rewards-table';
const txTimeout = Cypress.env('txTimeout');
const rewardsTimeOut = { timeout: 60000 };

context('rewards - flow', { tags: '@slow' }, function () {
  before('set up environment to allow rewards', function () {
    cy.visit('/');
    cy.wait_for_spinner();
    cy.deposit_asset(vegaAssetAddress, '1000');
    cy.validatorsSelfDelegate();
    cy.ethereum_wallet_connect();
    cy.connectVegaWallet();
    topUpRewardsPool();
    cy.navigate_to('validators');
    cy.vega_wallet_teardown();
    cy.staking_page_associate_tokens('6000');
    cy.get(vegaWalletUnstakedBalance, txTimeout).should(
      'contain',
      '6,000.0',
      txTimeout
    );
    cy.get('button').contains('Select a validator to nominate').click();
    cy.click_on_validator_from_list(0);
    cy.staking_validator_page_add_stake('3000');
    cy.close_staking_dialog();
    cy.navigate_to('validators');
    cy.click_on_validator_from_list(1);
    cy.staking_validator_page_add_stake('3000');
    cy.close_staking_dialog();
    cy.navigate_to('rewards');
  });

  it('Should display rewards per epoch', function () {
    cy.getByTestId(rewardsTable, rewardsTimeOut).should('exist');
    cy.getByTestId(rewardsTable)
      .first()
      .within(() => {
        cy.getByTestId('asset').should('have.text', 'Vega');
        cy.getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD').should('have.text', '1');
        cy.getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE').should(
          'have.text',
          '0'
        );
        cy.getByTestId('total').should('have.text', '1');
      });
  });

  it('Should update when epoch starts', function () {
    cy.getByTestId(rewardsTable)
      .first()
      .within(() => {
        cy.get('h2').first().invoke('text').as('epochNumber');
      });
    cy.wait_for_beginning_of_epoch();
    cy.get('@epochNumber').then((epochNumber) => {
      cy.getByTestId(rewardsTable)
        .first()
        .within(() => {
          cy.get('h2').first().invoke('text').should('not.equal', epochNumber);
        });
    });
  });

  // 2002-SINC-009 2002-SINC-010 2002-SINC-011 2002-SINC-012
  it('Should display table of rewards earned by connected vega wallet', function () {
    cy.getByTestId('epoch-reward-view-toggle-individual').click();
    cy.getByTestId('connected-vega-key')
      .find('span')
      .should('have.text', Cypress.env('vegaWalletPublicKey'));
    cy.getByTestId('epoch-individual-rewards-table')
      .first()
      .within(() => {
        cy.get('h2').first().should('contain.text', 'EPOCH');
        cy.getByTestId('individual-rewards-asset').should('have.text', 'Vega');
        cy.getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD')
          .should('contain.text', '0.4415')
          .and('contain.text', '(44.15%)');
        cy.getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE')
          .should('contain.text', '0.0004')
          .and('contain.text', '(44.15%)');
        cy.getByTestId('total').should('have.text', '0.4419');
      });
  });

  function topUpRewardsPool() {
    // Must ensure that test wallet contains assets already and that the tests are within the start and end epochs
    cy.exec(
      `vega wallet transaction send --wallet ${Cypress.env(
        'vegaWalletName'
      )} --pubkey ${Cypress.env(
        'vegaWalletPublicKey'
      )} -p "./src/fixtures/wallet/passphrase" --network DV '{"transfer":{"fromAccountType":4,"toAccountType":12,"to":"0000000000000000000000000000000000000000000000000000000000000000","asset":"b4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b","amount":"1000000000000000000","recurring":{"startEpoch":30, "endEpoch": 200, "factor":"1"}}}' --home ${Cypress.env(
        'vegaWalletLocation'
      )}`,
      { failOnNonZeroExit: false }
    )
      .its('stderr')
      .should('contain', '');
  }
});
