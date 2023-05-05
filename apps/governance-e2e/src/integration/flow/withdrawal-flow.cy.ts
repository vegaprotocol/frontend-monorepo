import {
  navigateTo,
  navigation,
  waitForSpinner,
} from '../../support/common.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import { depositAsset } from '../../support/wallet-teardown.functions';

const withdraw = 'withdraw';
const withdrawalForm = 'withdraw-form';
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
const tableTxHash = '[col-id="txHash"]';
const tableAssetSymbol = '[col-id="asset.symbol"]';
const tableAmount = '[col-id="amount"]';
const tableReceiverAddress = '[col-id="details.receiverAddress"]';
const tableWithdrawnTimeStamp = '[col-id="withdrawnTimestamp"]';
const tableWithdrawnStatus = '[col-id="status"]';
const tableCreatedTimeStamp = '[col-id="createdTimestamp"]';
const toastContent = 'toast-content';
const toastPanel = 'toast-panel';
const usdtName = 'USDC (local)';
const usdcEthAddress = '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0';
const usdcSymbol = 'tUSDC';
const usdtSelectValue =
  '993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede';
const truncatedWithdrawalEthAddress = '0xEe7D…22d94F';
const formValidationError = 'input-error-text';
const txTimeout = Cypress.env('txTimeout');

context(
  'Withdrawals - with eth and vega wallet connected',
  { tags: '@slow' },
  function () {
    before('visit withdrawals and connect vega wallet', function () {
      cy.visit('/');
      // When running tests locally, will fail if run without restarting capsule
      cy.updateCapsuleMultiSig().then(() => {
        ethereumWalletConnect();
        depositAsset(usdcEthAddress, '1000', 5);
      });
    });

    beforeEach('Navigate to withdrawal page', function () {
      cy.clearLocalStorage();
      cy.reload();
      waitForSpinner();
      navigateTo(navigation.withdraw);
      cy.connectVegaWallet();
      ethereumWalletConnect();
    });

    it('Able to open withdrawal form with vega wallet connected', function () {
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.get('select').find('option').should('have.length.at.least', 2);
        cy.getByTestId(ethAddressInput).should('be.visible');
        cy.getByTestId(amountInput).should('be.visible');
      });
    });

    it('Unable to submit withdrawal with invalid fields', function () {
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.get('select').select(usdtSelectValue, { force: true });
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
    });

    it('Able to withdraw asset: -eth wallet connected -withdraw funds button', function () {
      // fill in withdrawal form
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.get('select').select(usdtSelectValue, { force: true });
        cy.getByTestId(balanceAvailable, txTimeout).should('exist');
        cy.getByTestId(withdrawalThreshold).should(
          'have.text',
          '100,000.00000T'
        );
        cy.getByTestId(delayTime).should('have.text', 'None');
        cy.getByTestId(amountInput).click().type('120');
        cy.getByTestId(submitWithdrawalButton).click();
      });

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
      cy.getByTestId(withdrawalAmount).should('have.text', '120.00');
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
      // withdrawal history for complete withdrawal displayed
      cy.get(tableWithdrawnStatus)
        .eq(1, txTimeout)
        .should('have.text', 'Completed')
        .parent()
        .within(() => {
          cy.get(tableAssetSymbol).should('have.text', usdcSymbol);
          cy.get(tableAmount).should('have.text', '120.00');
          cy.get(tableReceiverAddress)
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/address/');
          cy.get(tableWithdrawnTimeStamp).should('not.be.empty');
          cy.get(tableTxHash)
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/tx/');
        });
    });

    it('Able to withdraw asset: -eth wallet not connected', function () {
      const ethWalletAddress = Cypress.env('ethWalletPublicKey');
      cy.reload();
      waitForAssetsDisplayed(usdtName);
      // fill in withdrawal form
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.get('select').select(usdtSelectValue, { force: true });
        cy.getByTestId(ethAddressInput).should('be.empty');
        cy.getByTestId(amountInput).click().type('110');
        cy.getByTestId(submitWithdrawalButton).click();

        // Need eth address to submit withdrawal
        cy.getByTestId(formValidationError).should('have.length', 1);
        cy.getByTestId(ethAddressInput).click().type(ethWalletAddress);
        cy.getByTestId(submitWithdrawalButton).click();
      });

      cy.contains('Awaiting network confirmation').should('be.visible');
      // assert withdrawal request
      cy.getByTestId(dialogTitle, txTimeout).should(
        'have.text',
        'Transaction complete'
      );
      cy.getByTestId(dialogClose).click();
      cy.get(tableTxHash)
        .eq(1)
        .should('have.text', 'Complete withdrawal')
        .parent()
        .within(() => {
          cy.get(tableAssetSymbol).should('have.text', usdcSymbol);
          cy.get(tableAmount).should('have.text', '110.00');
          cy.get(tableReceiverAddress)
            .find('a')
            .should('have.attr', 'href')
            .and('contain', 'https://sepolia.etherscan.io/address/');
          cy.get(tableCreatedTimeStamp).should('not.be.empty');
        });
      ethereumWalletConnect();
      cy.getByTestId(completeWithdrawalButton).click();
      cy.getByTestId(toastContent)
        .last()
        .should('contain.text', 'Awaiting confirmation')
        .within(() => {
          cy.getByTestId('external-link').should('exist');
        });
      cy.getByTestId(toastContent)
        .first()
        .should('contain.text', 'The withdrawal has been approved.')
        .within(() => {
          cy.getByTestId(toastPanel).should('contain.text', '110.00', 'tUSDC');
        });
      cy.getByTestId(toastContent)
        .last()
        .should('contain.text', 'Transaction confirmed')
        .within(() => {
          cy.getByTestId('external-link').should('exist');
        });
    });

    it('Unable to withdraw asset on pub key view', function () {
      const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey');
      const expectedErrorTxt = `You are connected in a view only state for public key: ${vegaWalletPubKey}. In order to send transactions you must connect to a real wallet.`;

      // Disconnect vega wallet
      cy.getByTestId('manage-vega-wallet').last().click();
      cy.getByTestId('disconnect').click();

      cy.connectPublicKey(vegaWalletPubKey);
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.get('select').select(usdtSelectValue, { force: true });
        cy.getByTestId(balanceAvailable, txTimeout).should('exist');
        cy.getByTestId(amountInput).click().type('100');
        cy.getByTestId(submitWithdrawalButton).click();
      });

      cy.getByTestId('dialog-content')
        .last()
        .within(() => {
          cy.get('h1').should('have.text', 'Transaction failed');
          cy.getByTestId('Error').should('have.text', expectedErrorTxt);
        });
    });

    function waitForAssetsDisplayed(expectedAsset: string) {
      cy.getByTestId('currency-title', txTimeout).should(
        'contain.text',
        expectedAsset
      );
    }
  }
);
