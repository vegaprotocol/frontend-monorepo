const withdraw = 'withdraw';
const selectAsset = 'select-asset';
const ethAddressInput = 'eth-address-input';
const amountInput = 'amount-input';
const balanceAvailable = 'BALANCE_AVAILABLE_value';
const withdrawalThreshold = 'WITHDRAWAL_THRESHOLD_value';
const delayTime = 'DELAY_TIME_value';
const submitWithdrawalButton = 'submit-withdrawal';
const dialogTitle = 'dialog-title';
const dialogClose = 'dialog-close';
const txExplorerLink = 'tx-block-explorer';
const withdrawalAssetSymbol = 'withdrawal-asset-symbol';
const withdrawalAmount = 'withdrawal-amount';
const withdrawalRecipient = 'withdrawal-recipient';
const withdrawFundsButton = 'withdraw-funds';
const completeWithdrawalButton = 'complete-withdrawal';
const usdtName = 'USDC (local)';
const usdcEthAddress = '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0';
const usdcSymbol = 'tUSDC';
const truncatedWithdrawalEthAddress = '0xEe7D…22d94F';
const formValidationError = 'input-error-text';
const txTimeout = Cypress.env('txTimeout');

context(
  'Withdrawals - with eth and vega wallet connected',
  { tags: '@slow' },
  function () {
    before('visit withdrawals and connect vega wallet', function () {
      cy.updateCapsuleMultiSig(); // When running tests locally, will fail if run without restarting capsule
      cy.deposit_asset(usdcEthAddress);
    });

    beforeEach('Navigate to withdrawal page', function () {
      cy.reload();
      cy.visit('/');
      cy.wait_for_spinner();
      cy.navigate_to('withdraw');
      cy.connectVegaWallet();
      cy.ethereum_wallet_connect();
      cy.vega_wallet_teardown();
    });

    it('Able to open withdrawal form with vega wallet connected', function () {
      // needs to reload page for withdrawal form to be displayed in ci - not reproducible outside of ci
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(selectAsset)
        .find('option')
        .should('have.length.at.least', 2);
      cy.getByTestId(ethAddressInput).should('be.visible');
      cy.getByTestId(amountInput).should('be.visible');
    });

    it('Unable to submit withdrawal with invalid fields', function () {
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(selectAsset).select(usdtName);
      cy.getByTestId(balanceAvailable, txTimeout).should('exist');
      cy.getByTestId(submitWithdrawalButton).click();
      cy.getByTestId(formValidationError).should('have.length', 1);
      cy.getByTestId(amountInput).clear().click().type('0.0000001');
      cy.getByTestId(submitWithdrawalButton).click();
      cy.getByTestId(formValidationError).should(
        'have.text',
        'Value is below minimum'
      );
      cy.getByTestId(amountInput).clear().click().type('10');
      cy.getByTestId(ethAddressInput).click().type('123');
      cy.getByTestId(submitWithdrawalButton).click();
      cy.getByTestId(formValidationError).should(
        'have.text',
        'Invalid Ethereum address'
      );
    });

    it('Able to withdraw asset: -eth wallet connected -withdraw funds button', function () {
      // fill in withdrawal form
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(selectAsset).select(usdtName);
      cy.getByTestId(balanceAvailable, txTimeout).should('exist');
      cy.getByTestId(withdrawalThreshold).should('have.text', '100,000.00000T');
      cy.getByTestId(delayTime).should('have.text', 'None');
      cy.getByTestId(amountInput).click().type('100');
      cy.getByTestId(submitWithdrawalButton).click();

      cy.contains('Awaiting network confirmation').should('be.visible');
      // assert withdrawal request
      cy.getByTestId(dialogTitle, txTimeout).should(
        'have.text',
        'Transaction complete'
      );
      cy.getByTestId(txExplorerLink)
        .should('have.attr', 'href')
        .and('contain', '/txs/');
      cy.getByTestId(withdrawalAssetSymbol).should('have.text', usdcSymbol);
      cy.getByTestId(withdrawalAmount).should('have.text', '100.00');
      cy.getByTestId(withdrawalRecipient)
        .should('have.text', truncatedWithdrawalEthAddress)
        .and('have.attr', 'href')
        .and('contain', `/address/${Cypress.env('ethWalletPublicKey')}`);
      cy.getByTestId(withdrawFundsButton).click();
      // withdrawal complete
      cy.getByTestId(dialogTitle, txTimeout).should(
        'have.text',
        'Withdraw asset complete'
      );
      cy.getByTestId(dialogClose).click();

      // need to reload page to see withdrawal history complete
      cy.reload();
      waitForAssetsDisplayed(usdtName);

      // withdrawal history for complete withdrawal displayed
      cy.get('[col-id="txHash"]', txTimeout)
        .should('have.length.above', 1)
        .eq(1)
        .parent()
        .within(() => {
          cy.get('[col-id="asset.symbol"]').should('have.text', usdcSymbol);
          cy.get('[col-id="amount"]').should('have.text', '100.00');
          cy.get('[col-id="details.receiverAddress"]')
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/address/');
          cy.get('[col-id="withdrawnTimestamp"]').should('not.be.empty');
          cy.get('[col-id="status"]').should('have.text', 'Completed');
          cy.get('[col-id="txHash"]')
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/tx/');
        });
    });

    // Skipping because of bug #1857
    it.skip('Able to withdraw asset: -eth wallet not connected', function () {
      const ethWalletAddress = Cypress.env('ethWalletPublicKey');
      cy.reload();
      waitForAssetsDisplayed(usdtName);
      // fill in withdrawal form
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(selectAsset).select(usdtName);
      cy.getByTestId(ethAddressInput).should('be.empty');
      cy.getByTestId(amountInput).click().type('100');
      cy.getByTestId(submitWithdrawalButton).click();

      // Need eth address to submit withdrawal
      cy.getByTestId(formValidationError).should('have.length', 1);
      cy.getByTestId(ethAddressInput).click().type(ethWalletAddress);
      cy.getByTestId(submitWithdrawalButton).click();

      cy.contains('Awaiting network confirmation').should('be.visible');
      // assert withdrawal request
      cy.getByTestId(dialogTitle, txTimeout).should(
        'have.text',
        'Transaction complete'
      );
      cy.getByTestId(dialogClose).click();

      cy.getByTestId(completeWithdrawalButton)
        .eq(0)
        .parent()
        .parent()
        .within(() => {
          cy.get('[col-id="asset.symbol"]').should('have.text', usdcSymbol);
          cy.get('[col-id="amount"]').should('have.text', '100.00');
          cy.get('[col-id="details.receiverAddress"]')
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/address/');
          cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
          cy.getByTestId(completeWithdrawalButton).click();
        });
    });

    function waitForAssetsDisplayed(expectedAsset) {
      cy.contains(expectedAsset, txTimeout).should('be.visible');
    }
  }
);
