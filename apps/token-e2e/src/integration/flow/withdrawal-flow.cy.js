import { verify } from 'crypto';

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
const usdtName = 'USDC (local)';
const usdcEthAddress = '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0';
const usdcSymbol = 'tUSDC';
const txTimeout = Cypress.env('txTimeout');

context(
  'Withdrawals - with eth and vega wallet connected',
  { tags: '@slow' },
  function () {
    before('visit withdrawals and connect vega wallet', function () {
      // cy.updateCapsuleMultiSig(); // When running tests locally, will fail if run without restarting capsule
      cy.vega_wallet_import();
      cy.deposit_asset(usdcEthAddress);
    });

    beforeEach('Navigate to withdrawal page', function () {
      cy.visit('/');
      cy.navigate_to('withdrawals');
      cy.vega_wallet_connect();
      cy.ethereum_wallet_connect();
    });

    it('Able to open withdrawal form with vega wallet connected', function () {
      waitForAssetsDisplayed(usdtName);
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(selectAsset)
        .find('option')
        .should('have.length.at.least', 5);
      cy.getByTestId(ethAddressInput).should('be.visible');
      cy.getByTestId(amountInput).should('be.visible');
    });

    it.only('Able to withdraw asset', function () {
      waitForAssetsDisplayed(usdtName);
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
      cy.getByTestId(withdrawalAmount).should('have.text', '100.00000');
      cy.getByTestId(withdrawalRecipient)
        .should('have.text', '0xEe7D…22d94F')
        .and('have.attr', 'href')
        .and('contain', '/address/0xEe7D375bcB50C26d52E1A4a472D8822A2A22d94F');
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

      // withdrawal history displayed
      cy.get('[row-id="0"]')
        .eq(4)
        .within(() => {
          cy.get('[col-id="asset.symbol"]').should('have.text', usdcSymbol);
          cy.get('[col-id="amount"]').should('have.text', '100.00000');
          cy.get('[col-id="details.receiverAddress"]')
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/address/');
          cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
          cy.get('[col-id="status"]').should('have.text', 'Completed');
          cy.get('[col-id="txHash"]')
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/tx/');
        });
    });

    function waitForAssetsDisplayed(expectedAsset) {
      cy.contains(expectedAsset, txTimeout).should('be.visible');
    }
  }
);
