import {
  navigateTo,
  navigation,
  turnTelemetryOff,
  waitForSpinner,
} from '../../support/common.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import { depositAsset } from '../../support/wallet-functions';

const withdraw = 'withdraw';
const withdrawalForm = 'withdraw-form';
const ethAddressInput = 'eth-address-input';
const amountInput = 'amount-input';
const balanceAvailable = 'BALANCE_AVAILABLE_value';
const withdrawalThreshold = 'WITHDRAWAL_THRESHOLD_value';
const delayTime = 'DELAY_TIME_value';
const submitWithdrawalButton = 'submit-withdrawal';
const dialogClose = 'dialog-close';
const completeWithdrawalButton = 'complete-withdrawal';
const tableTxHash = '[col-id="txHash"]';
const tableAssetSymbol = '[col-id="asset.symbol"]';
const tableAmount = '[col-id="amount"]';
const tableReceiverAddress = '[col-id="details.receiverAddress"]';
const tableWithdrawnTimeStamp = '[col-id="withdrawnTimestamp"]';
const tableWithdrawnStatus = '[col-id="status"]';
const tableCreatedTimeStamp = '[col-id="createdTimestamp"]';
const toast = 'toast';
const toastPanel = 'toast-panel';
const toastClose = 'toast-close';
const withdrawalDialogContent = 'dialog-content';
const toastCompleteWithdrawal = 'toast-complete-withdrawal';
const usdtName = 'USDC (local)';
const usdcEthAddress = '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0';
const usdcSymbol = 'tUSDC';
const usdtSelectValue =
  '993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede';
const formValidationError = 'input-error-text';
const txTimeout = Cypress.env('txTimeout');

context(
  'Withdrawals - with eth and vega wallet connected',
  { tags: '@slow' },
  function () {
    before('visit withdrawals and connect vega wallet', function () {
      cy.visit('/');
      ethereumWalletConnect();
      depositAsset(usdcEthAddress, '1000', 5);
    });

    beforeEach('Navigate to withdrawal page', function () {
      cy.clearLocalStorage();
      turnTelemetryOff();
      cy.reload();
      waitForSpinner();
      navigateTo(navigation.withdraw);
      cy.connectVegaWallet();
      ethereumWalletConnect();
      cy.getByTestId('currency-title', txTimeout).should(
        'contain.text',
        usdtName
      );
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
        cy.getByTestId('select-asset').click();
        cy.get('select')
          .select(usdtSelectValue, { force: true })
          .should('have.value', usdtSelectValue);
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

    it(
      'Able to withdraw asset: -eth wallet connected -withdraw funds button',
      { tags: '@smoke' },
      function () {
        // fill in withdrawal form
        cy.getByTestId(withdraw).should('be.visible').click();
        cy.getByTestId(withdrawalForm, txTimeout).within(() => {
          cy.getByTestId('select-asset').click();
          cy.get('select')
            .select(usdtSelectValue, { force: true })
            .should('have.value', usdtSelectValue);
          cy.getByTestId(balanceAvailable, txTimeout).should('exist');
          cy.getByTestId(withdrawalThreshold).should(
            'have.text',
            '100,000.00000T'
          );
          cy.getByTestId(delayTime).should('have.text', 'None');
          cy.getByTestId(amountInput).click().type('120');
          cy.getByTestId(submitWithdrawalButton).click();
        });
        cy.getByTestId(toast)
          .first(txTimeout)
          .should('contain.text', 'Funds unlocked')
          .within(() => {
            cy.getByTestId('external-link').should('exist');
            cy.getByTestId(toastPanel).should(
              'contain.text',
              'Withdraw 120.00 tUSDC'
            );
            cy.getByTestId(toastCompleteWithdrawal).click();
            cy.getByTestId(toastClose).click();
          });
        // withdrawal complete
        cy.getByTestId(toast)
          .first(txTimeout)
          .should('contain.text', 'The withdrawal has been approved.')
          .within(() => {
            cy.getByTestId(toastPanel).should(
              'contain.text',
              'Withdraw 120.00 tUSDC'
            );
          });
        cy.getByTestId(toast)
          .last(txTimeout)
          .should('contain.text', 'Transaction confirmed')
          .within(() => {
            cy.getByTestId('external-link').should('exist');
          });
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
      }
    );

    it('Able to withdraw asset: -eth wallet not connected', function () {
      const ethWalletAddress = Cypress.env('ethWalletPublicKey');
      cy.reload();
      waitForAssetsDisplayed(usdtName);
      // fill in withdrawal form
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.getByTestId('select-asset').click();
        cy.get('select')
          .select(usdtSelectValue, { force: true })
          .should('have.value', usdtSelectValue);
        cy.getByTestId(ethAddressInput).should('be.empty');
        cy.getByTestId(amountInput).click().type('110');
        cy.getByTestId(submitWithdrawalButton).click();

        // Need eth address to submit withdrawal
        cy.getByTestId(formValidationError).should('have.length', 1);
        cy.getByTestId(ethAddressInput).click().type(ethWalletAddress);
        cy.getByTestId(submitWithdrawalButton).click();
      });

      cy.getByTestId(toast)
        .first(txTimeout)
        .should('contain.text', 'Funds unlocked')
        .within(() => {
          cy.getByTestId('external-link').should('exist');
          cy.getByTestId(toastPanel).should(
            'contain.text',
            'Withdraw 110.00 tUSDC'
          );
          cy.getByTestId(toastClose).click();
        });
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
      cy.getByTestId(completeWithdrawalButton).first().click();
      cy.getByTestId(toast)
        .last(txTimeout)
        .should('contain.text', 'Awaiting confirmation')
        .within(() => {
          cy.getByTestId('external-link').should('exist');
        });
      cy.getByTestId(toast)
        .first(txTimeout)
        .should('contain.text', 'The withdrawal has been approved.')
        .within(() => {
          cy.getByTestId(toastPanel).should('contain.text', '110.00', 'tUSDC');
        });
      cy.getByTestId(toast)
        .last(txTimeout)
        .should('contain.text', 'Transaction confirmed')
        .within(() => {
          cy.getByTestId('external-link').should('exist');
        });
    });

    it('Should be able to see withdrawal details from toast', function () {
      cy.getByTestId(withdraw).click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.getByTestId('select-asset').click();
        cy.get('select')
          .select(usdtSelectValue, { force: true })
          .should('have.value', usdtSelectValue);
        cy.getByTestId(balanceAvailable, txTimeout).should('exist');
        cy.getByTestId(withdrawalThreshold).should(
          'have.text',
          '100,000.00000T'
        );
        cy.getByTestId(amountInput).click().type('50');
        cy.getByTestId(submitWithdrawalButton).click();
      });
      cy.getByTestId(toast)
        .first(txTimeout)
        .should('contain.text', 'Funds unlocked')
        .within(() => {
          cy.getByTestId('external-link').should('exist');
          cy.getByTestId(toastPanel).should(
            'contain.text',
            'Withdraw 50.00 tUSDC'
          );
          cy.contains('save your withdrawal details').click();
        });
      cy.getByTestId(withdrawalDialogContent)
        .last()
        .within(() => {
          cy.getByTestId('assetSource_value').should(
            'have.text',
            '0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0'
          );
          cy.getByTestId('amount_value').should('have.text', '5000000');
          cy.getByTestId('nonce_value').invoke('text').should('not.be.empty');
          cy.getByTestId('signatures_value')
            .invoke('text')
            .should('not.be.empty');
          cy.getByTestId('targetAddress_value').should(
            'have.text',
            Cypress.env('ethWalletPublicKey')
          );
          cy.getByTestId('creation_value')
            .invoke('text')
            .should('not.be.empty');
        });
      cy.getByTestId(dialogClose).click();
    });

    // Skipping test due to bug #3882
    it.skip('Unable to withdraw asset on pub key view', function () {
      const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey');
      const expectedErrorTxt = `You are connected in a view only state for public key: ${vegaWalletPubKey}. In order to send transactions you must connect to a real wallet.`;

      // Disconnect vega wallet
      cy.getByTestId('manage-vega-wallet').last().click();
      cy.getByTestId('disconnect').click();

      cy.connectPublicKey(vegaWalletPubKey);
      cy.getByTestId(withdraw).should('be.visible').click();
      cy.getByTestId(withdrawalForm, txTimeout).within(() => {
        cy.getByTestId('select-asset').click();
        cy.get('select')
          .select(usdtSelectValue, { force: true })
          .should('have.value', usdtSelectValue);
        cy.getByTestId(balanceAvailable, txTimeout).should('exist');
        cy.getByTestId(amountInput).click().type('100');
        cy.pause();
        cy.getByTestId(submitWithdrawalButton).click();
      });

      cy.getByTestId(withdrawalDialogContent)
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
